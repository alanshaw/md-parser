var inherits = require("util").inherits
var Element = require("./element")

function Ul () {
  Element.call(this)
  this.tagName = "ul"
}
inherits(Ul, Element)

Ul.prototype.canAppendChild = function (node) {
  return node.tagName == "li"
}

module.exports = Ul