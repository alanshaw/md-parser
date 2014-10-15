var fs = require("fs")
var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")
var Element = require("./dom/element")
var Text = require("./dom/text")

var parser = {
  "heading": require("./parse/heading"),
  "underline equal": require("./parse/underline-equal"),
  "underline dash": require("./parse/underline-dash"),
  "star": require("./parse/star"),
  "list item ordered": require("./parse/list-item-ordered"),
  "emphasis": require("./parse/emphasis"),
  "code inline": require("./parse/code-inline"),
  "gt": require("./parse/gt"),
  "whitespace": require("./parse/whitespace"),
  "code block": require("./parse/code-block"),
  "text": require("./parse/text"),
  "new line": require("./parse/new-line")
}

function parse (token, elements) {
  // Tokens in preformatted elements are just text until next "code block" token
  if (elements.current.tagName == "pre" && token.type != "code block") {
    elements.current.appendChild(new Text(token.content))
    return elements
  }

  if (!parser[token.type]) {
    throw new Error("Unknown token '" + token.type + "' with content '" + token.content + "'")
  }

  return parser[token.type](token, elements)
}

function pushNode (node, ts) {
  if (node instanceof Element) {
    ts.push("<" + node.tagName + ">")
    node.children.forEach(function (child) { pushNode(child, ts) })
    ts.push("</" + node.tagName + ">")
  } else if (node instanceof Text) {
    ts.push(node.content)
  } else {
    ts.emit("error", new Error("Unknown node type " + node))
  }
}

module.exports = function (opts) {
  var root = new Element
  var current = new Text
  root.appendChild(current)
  var elements = {current: current, next: new Element}

  var parser = through.obj(function (token, enc, cb) {
    elements = parse(token, elements)

    if (root.children.length > 1) {
      pushNode(root.children.splice(0, 1)[0], this)
    }

    cb()
  }, function () {
    pushNode(root.children.splice(0, 1)[0], this)
    this.push(null)
  })

  var tokenizer = mdtok()
  tokenizer.pipe(parser)

  return duplexer(tokenizer, parser)
}