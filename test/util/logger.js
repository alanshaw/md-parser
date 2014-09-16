var concat = require("concat-stream")
var mdparse = require("../../")

module.exports = function (md) {
  var parse = mdparse()

  parse.pipe(concat(function (data) {
    console.log(data)
  }))

  parse.write(md)
  parse.end()
}