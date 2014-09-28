var test = require("tape")
var multiline = require("multiline")
var concat = require("concat-stream")

var marked = require("marked")
var mdparse = require("../")


test("parse", function (t) {
  t.plan(1)

  var mdParseTime
  var markedTime

  var md = multiline.stripIndent(function () {/*
    Heading 1
    ===
    Some *italic* and __bold__ in the title
    **and** also in some _text_

    Heading 2
    ---------  
    Some more text

    ### Heading 3
    Lorem ipsum dolor sit amet, consectetur adipiscing elit

    * Bullet 1
        * Sub bullet 1
        * Sub bullet 2
    * Third
    * Third *2*
        * Sub bullet 3
    * Bullet 2
    * Bullet 3
        * Another sub
    More regular text
  */})

  console.time("marked")
  now = Date.now()
  marked(md)
  markedTime = Date.now() - now
  console.timeEnd("marked")
  console.log("marked", markedTime + "ms")

  var parse = mdparse()

  parse.pipe(concat(function (data) {
    mdParseTime = Date.now() - now
    console.log("md-parser", mdParseTime + "ms")
    console.timeEnd("md-parser")

    t.ok(mdParseTime < markedTime, "Faster than marked")
    t.end()
  }))

  var now = Date.now()
  console.time("md-parser")
  parse.write(md)
  parse.end()


  

  //runner(t, md, tokens)
})