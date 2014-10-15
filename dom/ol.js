var inherits = require("util").inherits
var Element = require("./element")

function Ol () {
  Element.call(this)
  this.tagName = "ol"
}
inherits(Ol, Element)

Ol.prototype.canAppendChild = function (node) {
  return node.tagName == "li"
}

module.exports = Ol