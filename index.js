var mdtok = require("md-tokenizer")
var through = require("through2")
var duplexer = require("duplexer2")

function Env (parent) {
  this.parent = parent
}

function parse (chunk, env, tr) {
  switch (chunk.type) {
    case "heading":
      if (!env.parent) {
        tr.push("<h" + chunk.content.length + ">")
        env = new Env(env)
        env.closeTag = "</h" + chunk.content.length + ">"
      } else {
        tr.push(chunk.content)
      }
      break
    case "star":
      if (!env.parent) {
        if (!env.inList) {
          tr.push("<ul>")
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
          env.closeTag = "</strong>"
        } else {
          tr.push("<em>")
          env.closeTag = "</em>"
        }
        env.inEmphasis = true
      } else {
        tr.push(env.closeTag)
        env = env.parent
      }
      break
    case "whitespace":
    case "text":
      tr.push(chunk.content)
      break
    case "new line":
      tr.push(env.closeTag)
      env = env.parent
      break
    default: throw new Error("Failed to parse " + chunk.content)
  }

  return env
}

module.exports = function (opts) {
  var env = new Env

  var parser = through.obj(function (chunk, enc, cb) {
    env = parse(chunk, env, this)
    cb()
  })

  var tokenizer = mdtok()
  tokenizer.pipe(parser)

  return duplexer(tokenizer, parser)
}
