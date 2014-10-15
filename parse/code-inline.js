var Element = require("../dom/element")

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.tagName = "p"
    elements.current.parent.appendChild(elements.next)
    elements.current = elements.next
    elements.next = null
  }

  if (elements.current.tagName == "code") {
    // code end
    elements.current = elements.current.parent
  } else {
    // code start
    var code = new Element
    code.tagName = "code"
    elements.current.appendChild(code)
    elements.current = code
  }
  return elements
}