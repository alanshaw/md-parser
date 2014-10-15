var Element = require("../dom/element")

module.exports = function (token, elements) {
  elements.next = new Element
  return elements
}