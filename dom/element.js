var inherits = require("util").inherits
var Node = require("./node")

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

module.exports = Element