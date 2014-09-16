var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")

function Env (parent) {
  this.parent = parent
  this.chunks = []
}

function parse (chunk, env, tr) {
  switch (chunk.type) {
    case "heading":
      if (!env.closeTag) {
        tr.push("<h" + chunk.content.length + ">")
        env = new Env(env)
        env.closeTag = "</h" + chunk.content.length + ">"
      } else {
        tr.push(chunk.content)
      }
      break
    case "star":
      if (!env.closeTag) {
        if (!env.inList) {
          tr.push("<ul>")
          env = new Env(env)
          env.inList = true
          env.closeTag = "</ul>"
        }
        tr.push("<li>")
        env = new Env(env)
        env.closeTag = "</li>"
      } else {
        if (!env.inEmphasis) {
          env = new Env(env)
          tr.push("<em>")
          env.inline = true
          env.inEmphasis = true
          env.closeTag = "</em>"
        } else {
          tr.push(env.closeTag)
          env = env.parent
        }
      }
      break
    case "emphasis":
      if (!env.inEmphasis) {
        env = new Env(env)
        if (chunk.content == "__" || chunk.content == "**") {
          tr.push("<strong>")
          env.inEmphasis = true
          env.closeTag = "</strong>"
        } else {
          tr.push("<em>")
          env.inEmphasis = true
          env.closeTag = "</em>"
        }
        env.inline = true
      } else {
        tr.push(env.closeTag)
        env = env.parent
      }
      break
    case "whitespace":
      tr.push(chunk.content)
      break
    case "text":
      /*if (!env.closeTag) {
        tr.push("<p>")
        env.closeTag = "</p>"
      }*/
      tr.push(chunk.content)
      break
    case "new line":
      while (env.inline) {
        tr.push(env.closeTag)
        env = env.parent
      }
      if (env.closeTag) {
        tr.push(env.closeTag)
      }
      tr.push(chunk.content)
      env = new Env
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

  var parser = through.obj(function (chunk, enc, cb) {
    env = parse(chunk, env, this)
    cb()
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
