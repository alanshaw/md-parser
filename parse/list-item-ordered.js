var Ol = require("../dom/ol")
var Text = require("../dom/text")

module.exports = function (token, elements) {
  if (elements.next && !elements.next.tagName) {
    elements.next.tagName = "li"

    // Get closest li
    var li = elements.current

    while (li != null && li.tagName != "li") {
      li = li.parent
    }

    // Are we already in a list?
    if (!li) {
      // ul start
      var ul = new Ul
      elements.current.parent.appendChild(ul)
      elements.current = ul

      elements.current.appendChild(elements.next)
      elements.current = elements.next
      elements.next = null

    } else {

      if (li.indent == elements.next.indent) {
        li.parent.appendChild(elements.next)
      } else if (li.indent < elements.next.indent) {
        var ol = new Ol

        elements.current.appendChild(ol)
        elements.current = ol
        ol.appendChild(elements.next)

      } else if (li.indent > elements.next.indent) {
        var parents = []
        var parent = elements.current

        while (parent) {
          if (parent.tagName == "li") {
            parents.unshift(parent)
          }
          parent = parent.parent
        }

        parents[elements.next.indent].parent.appendChild(elements.next)
      }

      elements.current = elements.next
      elements.next = null
    }

  } else {
    // Just text
    if (elements.next && !elements.next.tagName) {
      elements.next.tagName = "p"
      elements.current.parent.appendChild(elements.next)
      elements.current = elements.next
      elements.next = null
    }
    elements.current.appendChild(new Text(token.content))
  }
  return elements
}