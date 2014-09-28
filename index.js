var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")

function Block (prev, tagName) {
  this.prev = prev // The previous block
  this.indent = ""
  this.tagName = tagName
  this.contents = [] // String, function
  this.transparent = false
  this.inEmphasis = false
  this.inStrongEmphasis = false
}

Block.prototype.open = function (tagName) {
  this.contents.push(function () {
    return "<" + this.tagName + ">"
  })
  this.tagName = tagName
  return this
}

function BlockEnd (start) {
  this.start = start
}

function indentAmount (whitespace) {
  return whitespace[0] == " " ? Math.floor(whitespace.length / 4) : whitespace.length
}

function closeEnds (ends, bl, tr) {
  //console.log(ends.map(function (e) {
  //  return e.start.tagName
  //}).reverse())
  if (!bl.prev) return ends

  ends = ends.slice()

  var prev = bl.prev
  var prevs = []

  while (prev) {
    prevs.unshift(prev)
    prev = prev.prev
  }

  prevs.forEach(function (p) {
    // Push out all the previous block's content
    for (var i = 0; i < p.contents.length; i++) {
      var content = p.contents[i]
      if (typeof content == "function") {
        tr.push(content.call(p))
      } else {
        tr.push(content)
      }
    }
  })

  // Difference between indent determines how far to chomp through ends
  var prevIndentAmount = indentAmount(bl.prev.indent)
  var currentIndentAmount = indentAmount(bl.indent)

  //console.log("prevIndentAmount", prevIndentAmount)
  //console.log("currentIndentAmount", currentIndentAmount)

  // Close everything?
  if (prevIndentAmount > currentIndentAmount && currentIndentAmount == 0) {
    var end = ends.pop()
    while (end) {
      //console.log("</" + end.start.tagName + ">")
      tr.push("</" + end.start.tagName + ">")
      end = ends.pop()
    }
  // Close subset?
  } else if (prevIndentAmount >= currentIndentAmount) {
    for (var j = 0; j < (prevIndentAmount - currentIndentAmount) + 1; j++) {
      var end = ends.pop()
      //console.log("</" + end.start.tagName + ">")
      tr.push("</" + end.start.tagName + ">")
      // If transparent then don't consume an iteration
      if (end.start.transparent && ends.length) j--
    }
  }

  // We no longer need this previous block - send for gc
  bl.prev = null

  return ends
}

function parse (token, bl, ends, tr) {
  var oldEnds = ends

  switch (token.type) {
    case "heading":
      if (!bl.tagName) {
        bl.open("h" + token.content.length)
        ends = closeEnds(ends, bl, tr)
        ends.push(new BlockEnd(bl))
      } else {
        bl.contents.push(token.content)
      }
      break
    case "underline equal":
      bl.prev.tagName = "h1"
      break
    case "underline dash":
      bl.prev.tagName = "h2"
      break
    case "star":
      if (!bl.tagName) {
        ends = closeEnds(ends, bl, tr)

        // Something was closed
        if (oldEnds.length != ends.length) {
          // Was the last thing closed an <li>?
          if (oldEnds.slice(ends.length)[0].start.tagName == "li") {
            // Already in a list
          } else {
            // Need to start a new list
            bl.open("ul")
            bl.transparent = true
            ends.push(new BlockEnd(bl))
            bl = new Block(bl)
            bl.indent = bl.prev.indent // Maintain indent
          }
        } else {
          bl.open("ul")
          bl.transparent = true
          ends.push(new BlockEnd(bl))
          bl = new Block(bl)
          bl.indent = bl.prev.indent // Maintain indent
        }

        bl.open("li")
        ends.push(new BlockEnd(bl))
      } else {
        bl.contents.push("<" + (bl.inEmphasis ? "/" : "") + "em>")
        bl.inEmphasis = !bl.inEmphasis
      }
      break
    case "emphasis":
      if (!bl.tagName) {
        bl.open("p")
        ends = closeEnds(ends, bl, tr)
        ends.push(new BlockEnd(bl))
      }

      if (token.content == "__" || token.content == "**") {
        bl.contents.push("<" + (bl.inStrongEmphasis ? "/" : "") + "strong>")
        bl.inStrongEmphasis = !bl.inStrongEmphasis
      } else {
        bl.contents.push("<" + (bl.inEmphasis ? "/" : "") + "em>")
        bl.inEmphasis = !bl.inEmphasis
      }
      break
    case "whitespace":
      if (!bl.tagName) {
        bl.indent = token.content
      }
      bl.contents.push(token.content)
      break
    case "text":
      if (!bl.tagName) {
        bl.open("p")
        ends = closeEnds(ends, bl, tr)
        ends.push(new BlockEnd(bl))
      }
      bl.contents.push(token.content)
      break
    case "new line":
      bl = new Block(bl)
      bl.contents.push(token.content)
      break
    case "end":
      closeEnds(ends, new Block(bl), tr)
      break
    default: throw new Error("Unknown token '" + token.type + "' with content '" + token.content + "'")
  }

  return {block: bl, ends: ends}
}

module.exports = function (opts) {
  var bl = new Block()
  var ends = []

  var parser = through.obj(function (token, enc, cb) {
    var bits = parse(token, bl, ends, this)
    bl = bits.block
    ends = bits.ends
    cb()
  }, function () {
    parse({type: "end"}, bl, ends, this)
    bl = new Block()
    ends = []
    this.push(null)
  })

  var tokenizer = mdtok()
  tokenizer.pipe(parser)

  return duplexer(tokenizer, parser)
}
