function Block (prev, stream, tagName, inline) {
  this.prev = prev // The previous block
  this.stream = stream
  this.tokens = [] // Tokens that make up this block

  this.tag = {
    name: tagName, // Name of the wrapper tag for this block
    inline: inline // Inline element or not
  }

  this.opened = false // True after opening tag has been pushed
  this.closed = false // True after closing tag has been pushed
  this.contentQueue = []

  if (tagName) {
    stream.push("<" + tagName + ">")
  }
}

Block.prototype.open = function (tagName, inline) {
  while (this.contentQueue.length) {
    this.stream.push(this.contentQueue.shift())
  }
  this.stream.push("<" + tagName + ">")
  this.tag.name = tagName
  this.tag.inline = inline
  return this
}

Block.prototype.close = function () {
  if (this.closed) return this

  var bl = this

  while (bl.inline) {
    bl.stream.push("</" + bl.tag.name + ">")
    bl = bl.prev
  }

  if (bl.tag.name) {
    bl.stream.push("</" + bl.tag.name + ">")
  }

  bl.closed = true
  return bl
}

Block.prototype.closePrev = function () {
  if (this.prev) {
    this.prev = this.prev.close()
  }
  return this
}

Block.prototype.closeAllPrev = function () {
  var bl = this.prev
  while (bl) {
    bl = bl.close()
    bl = bl.prev
  }
  this.prev = null // No need to keep hold of these
  return this
}

Block.prototype.pushOrQueueContent = function (content) {
  if (this.tag.name) this.stream.push(content)
  else this.contentQueue.push(content)
}

module.exports = Block