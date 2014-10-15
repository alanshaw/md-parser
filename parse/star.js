var Element = require("../dom/element")
var Ul = require("../dom/ul")

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
        var ul = new Ul

        elements.current.appendChild(ul)
        elements.current = ul
        ul.appendChild(elements.next)

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
  }
  return elements
}