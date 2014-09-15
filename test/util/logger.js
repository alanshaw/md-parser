var mdparse = require("../../")

module.exports = function (md) {
  var parse = mdparse()
  parse.on("data", function (data) {
    console.log(JSON.stringify(data))
  })
  parse.write(md)
  parse.end()
}