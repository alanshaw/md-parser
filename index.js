var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")
var inherits = require("util").inherits

// Oh WOW lets re-implement a subset of the DOM
// Yes, I'm actually doing this

function Node () {
  this.parent = null
}

function Element () {
  Node.call(this)
  this.tagName = null
  this.children = []
  this.indent = 0
}
inherits(Element, Node)

Element.prototype.canAppendChild = function (node) {
  return true
}

Element.prototype.appendChild = function (node) {
  var parent = this

  // If the node can't be appended to this it must be appended to the parent
  while (!parent.canAppendChild(node)) {
    parent = parent.parent
  }

  node.parent = parent

  return parent.children.push(node)
}

function Ul () {
  Element.call(this)
  this.tagName = "ul"
}
inherits(Ul, Element)

Ul.prototype.canAppendChild = function (node) {
  return node.tagName == "li"
}

function Text (content) {
  Node.call(this)
  this.content = content || ""
}
inherits(Text, Node)


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

function indentAmount (whitespace) {
  return whitespace[0] == " " ? Math.floor(whitespace.length / 4) : whitespace.length
}

function appendChild (parent, child) {
  var p = parent
  while (!p.canAppendChild(child)) {
    p = p.parent
  }
  p.appendChild(child)
}

function parse (token, elements) {
  switch (token.type) {
    case "heading":
      if (elements.next && !elements.next.tagName) {
        elements.next.tagName = "h" + token.content.length
        elements.current.parent.appendChild(elements.next)
        elements.current = elements.next
        elements.next = null
      } else {
        elements.current.appendChild(new Text(token.content))
      }
      break
    case "star":
      if (elements.next && !elements.next.tagName) {
        elements.next.tagName = "li"

        // Get closest li
        var li = elements.current

        while (li != null && li.tagName != "li") {
          li = li.parent
        }

        // Are we already in a list?
        if (!li) {
          // ul start
          var ul = new Ul
          elements.current.parent.appendChild(ul)
          elements.current = ul

          elements.current.appendChild(elements.next)
          elements.current = elements.next
          elements.next = null

        } else {

          if (li.indent == elements.next.indent) {
            li.parent.appendChild(elements.next)
          } else if (li.indent < elements.next.indent) {
            var ul = new Ul

            elements.current.appendChild(ul)
            elements.current = ul
            ul.appendChild(elements.next)

          } else if (li.indent > elements.next.indent) {
            var parents = []
            var parent = elements.current

            while (parent) {
              if (parent.tagName == "li") {
                parents.unshift(parent)
              }
              parent = parent.parent
            }

            parents[elements.next.indent].parent.appendChild(elements.next)
          }

          elements.current = elements.next
          elements.next = null
        }

      } else {
        if (elements.current.tagName == "em") {
          // em end
          elements.current = elements.current.parent
        } else {
          // em start
          var em = new Element
          em.tagName = "em"
          elements.current.appendChild(em)
          elements.current = em
        }
      }
      break
    case "whitespace":
      if (elements.next && !elements.next.tagName) {
        elements.next.indent = indentAmount(token.content)
      } else {
        elements.current.appendChild(new Text(token.content))
      }
      break
    case "text":
      if (elements.next && !elements.next.tagName) {
        elements.next.tagName = "p"
        elements.current.parent.appendChild(elements.next)
        elements.current = elements.next
        elements.next = null
      }
      elements.current.appendChild(new Text(token.content))
      break
    case "new line":
      elements.next = new Element
      break
    default: throw new Error("Unknown token '" + token.type + "' with content '" + token.content + "'")
  }

  return elements
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