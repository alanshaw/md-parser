var inherits = require("util").inherits
var Node = require("./node")

function Text (content) {
  Node.call(this)
  this.content = content || ""
}
inherits(Text, Node)

module.exports = Text