var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")
var Block = require("./block")

var emptyToken = {type: "whitespace", content: ""}

function inList (bl) {
  return bl.prev.tag.name == "li"
}

function inEmphasis (bl) {
  return bl.tag.name == "em" || bl.tag.name == "strong"
}

function parse (token, bl, tr) {
  switch (token.type) {
    case "heading":
      if (!bl.tag.name) {
        bl.closePrev()
        bl.open("h" + token.content.length)
      } else {
        tr.push(token.content)
      }
      break
    case "star":
      if (!bl.tag.name) {

        if (!inList(bl)) {
          bl.closeAllPrev()
          bl.open("ul")
          bl = new Block(bl, tr, "li")
        } else {
          // We are already in a list
          var ul = bl

          while (ul.tag.name != "ul") {
            ul = ul.prev
          }

          var currentIndent = ul.tokens[0] || emptyToken

          if (currentIndent.type != "whitespace") {
            currentIndent = emptyToken
          }

          var newIndent = bl.tokens[0] || emptyToken

          if (newIndent.type != "whitespace") {
            newIndent = emptyToken
          }

          if (currentIndent.content.length == newIndent.content.length) {
            // Same level, same indent
            bl.closePrev()
            bl.open("li")
          } else if (currentIndent.content.length < newIndent.content.length) {
            // Deeper level
            bl.open("ul")
            bl = new Block(bl, tr, "li")
          } else if (currentIndent.content.length > newIndent.content.length) {
            // Shallower level
            // TODO: determine correct level
            bl.closePrev()
            ul.close()
            ul.prev.close()
            bl = new Block(bl, tr, "li")
          }
        }
      } else {
        if (!inEmphasis(bl)) {
          bl = new Block(bl, tr, "em", true)
        } else {
          tr.push("</" + bl.tag.name + ">")
          bl = bl.prev
        }
      }
      break
    case "emphasis":
      if (!bl.tag.name) {
        bl.closeAllPrev().open("p")
      }

      if (!inEmphasis(bl)) {
        bl = new Block(bl, tr)
        if (token.content == "__" || token.content == "**") {
          bl = new Block(bl, tr, "strong", true)
        } else {
          bl = new Block(bl, tr, "em", true)
        }
      } else {
        tr.push("</" + bl.tag.name + ">")
        bl = bl.prev
      }
      break
    case "whitespace":
      bl.pushOrQueueContent(token.content)
      break
    case "text":
      if (!bl.tag.name) {
        bl.closeAllPrev().open("p")
      }
      tr.push(token.content)
      break
    case "new line":
      bl = new Block(bl, tr)
      bl.pushOrQueueContent(token.content)
      break
    case "end":
      bl.closeAllPrev().close()
      break
    default: throw new Error("Failed to parse " + token.content)
  }

  if (token.type != "new line") {
    bl.tokens.unshift(token)
  }

  return bl
}

module.exports = function (opts) {
  var bl = null

  var parser = through.obj(function (token, enc, cb) {
    bl = parse(token, bl, this)
    cb()
  }, function () {
    parse({type: "end"}, bl, this)
    this.push(null)
  })

  bl = new Block(null, parser)

  var tokenizer = mdtok()
  tokenizer.pipe(parser)

  return duplexer(tokenizer, parser)
}
