var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")

function Env (parent) {
  this.parent = parent
  this.chunks = []
  this.inline = false
  this.tagged = false
  this.closed = false
  this.contentQueue = []
}

function closeBlock (env, tr) {
  if (env.closed) return env

  while (env.inline) {
    tr.push("</" + env.closeTag + ">")
    env = env.parent
  }

  if (env.closeTag) {
    tr.push("</" + env.closeTag + ">")
  }

  env.closed = true
  return env
}

function closeParentBlock (env, tr) {
  if (env.parent && !env.parent.closed) {
    env.parent = closeBlock(env.parent, tr)
  }
  return env
}

function closeParentBlocks (env, tr) {
  var origEnv = env
  env = env.parent
  while (env) {
    env = closeBlock(env, tr)
    env = env.parent
  }
  return origEnv
}

function openBlock (env, tr, tag) {
  env = new Env(env)
  if (tr && tag) {
    startTag(env, tr, tag)
  }
  return env
}

function startTag (env, tr, tag) {
  while (env.contentQueue.length) {
    tr.push(env.contentQueue.shift())
  }
  tr.push("<" + tag + ">")
  env.closeTag = tag
  env.tagged = true
  return env
}

function pushOrQueue (env, tr, content) {
  if (env.tagged) tr.push(content)
  else env.contentQueue.push(content)
}

function inList (env) {
  return env.parent.closeTag == "li"
}

function inEmphasis (env) {
  return env.closeTag == "em" || env.closeTag == "strong"
}

function parse (chunk, env, tr) {
  switch (chunk.type) {
    case "heading":
      if (!env.tagged) {
        env = closeParentBlocks(env, tr)
        env = startTag(env, tr, "h" + chunk.content.length)
      } else {
        tr.push(chunk.content)
      }
      break
    case "star":
      if (!env.tagged) {

        if (!inList(env)) {
          env = closeParentBlocks(env, tr)
          env = startTag(env, tr, "ul")
          env = openBlock(env, tr, "li")
        } else {

          // We are already in a list

          var ul = env

          while (ul.closeTag != "ul") {
            ul = ul.parent
          }

          var whitespaceChunk = {type: "whitespace", content: ""}

          var currentIndent = ul.chunks[0] || whitespaceChunk

          if (currentIndent.type != "whitespace") {
            currentIndent = whitespaceChunk
          }

          var newIndent = env.chunks[0] || whitespaceChunk

          if (newIndent.type != "whitespace") {
            newIndent = whitespaceChunk
          }

          if (currentIndent.content.length == newIndent.content.length) {
            // Same level, same indent
            env = closeParentBlock(env, tr)
            env = startTag(env, tr, "li")
          } else if (currentIndent.content.length < newIndent.content.length) {
            // Deeper level
            env = startTag(env, tr, "ul")
            env = openBlock(env, tr, "li")
          } else if (currentIndent.content.length > newIndent.content.length) {
            // Shallower level
            // TODO: determine correct level
            env = closeParentBlock(env, tr)
            env = closeBlock(ul, tr)
            env = closeBlock(ul.parent, tr)
            env = openBlock(env, tr, "li")
          }

          //env = closeParentBlock(env, tr) // now env -> ul
        }
      } else {
        if (!inEmphasis(env)) {
          env = new Env(env)
          env = startTag(env, tr, "em")
          env.inline = true
        } else {
          tr.push("</" + env.closeTag + ">")
          env = env.parent
        }
      }
      break
    case "emphasis":
      if (!env.tagged) {
        env = closeParentBlocks(env, tr)
        env = startTag(env, tr, "p")
      }

      if (!inEmphasis(env)) {
        env = new Env(env)
        if (chunk.content == "__" || chunk.content == "**") {
          env = startTag(env, tr, "strong")
        } else {
          env = startTag(env, tr, "em")
        }
        env.inline = true
      } else {
        tr.push("</" + env.closeTag + ">")
        env = env.parent
      }
      break
    case "whitespace":
      pushOrQueue(env, tr, chunk.content)
      break
    case "text":
      if (!env.tagged) {
        env = closeParentBlocks(env, tr)
        env = startTag(env, tr, "p")
      }
      tr.push(chunk.content)
      break
    case "new line":
      env = openBlock(env)
      pushOrQueue(env, tr, chunk.content)
      break
    case "end":
      env = closeParentBlocks(env, tr)
      env = closeBlock(env, tr)
      break
    default: throw new Error("Failed to parse " + chunk.content)
  }

  if (chunk.type != "new line") {
    env.chunks.unshift(chunk)
  }

  return env
}

module.exports = function (opts) {
  var env = new Env
  env.ended = true

  var parser = through.obj(function (chunk, enc, cb) {
    env = parse(chunk, env, this)
    cb()
  }, function () {
    parse({type: "end"}, env, this)
    this.push(null)
  })

  /*var push = parser.push
  parser.push = function (data) {
    console.log(data)
    push.call(parser, data)
  }*/

  var tokenizer = mdtok()
  tokenizer.pipe(parser)

  return duplexer(tokenizer, parser)
}
