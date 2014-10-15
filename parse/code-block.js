var Element = require("../dom/element")
var Text = require("../dom/text")

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.tagName = "code"
    elements.current.parent.appendChild(elements.next)
    elements.current = elements.next
    elements.next = new Element
    elements.next.tagName = "pre"
    elements.current.appendChild(elements.next)
    elements.current = elements.next
    elements.next = null
  } else if (elements.current.tagName == "pre") {
    elements.current = elements.current.parent
  } else {
    elements.current.appendChild(new Text(token.content))
  }
  return elements
}