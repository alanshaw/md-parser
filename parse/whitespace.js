var Text = require("../dom/text")

function indentAmount (whitespace) {
  return whitespace[0] == " " ? Math.floor(whitespace.length / 4) : whitespace.length
}

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.indent = indentAmount(token.content)
  } else {
    elements.current.appendChild(new Text(token.content))
  }
  return elements
}