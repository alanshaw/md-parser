var Text = require("../dom/text")

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.tagName = "p"
    elements.current.parent.appendChild(elements.next)
    elements.current = elements.next
    elements.next = null
  }
  elements.current.appendChild(new Text(token.content))
  return elements
}