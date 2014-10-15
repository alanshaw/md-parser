var Element = require("../dom/element")

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.tagName = "p"
    elements.current.parent.appendChild(elements.next)
    elements.current = elements.next
    elements.next = null
  }

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
  return elements
}