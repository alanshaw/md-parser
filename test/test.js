var test = require("tape")
var multiline = require("multiline")
var logger = require("./util/logger")
//var runner = require("./util/runner")

test("parse", function (t) {
  var md = multiline.stripIndent(function () {/*
    # Heading 1
    Some *italic* and __bold__ in the title
    **and** also in some _text_
    ## Heading 2
    Some more text
    * Bullet 1
        * Sub bullet 1
        * Sub bullet 2
        * Sub bullet 3
    * Bullet 2
    * Bullet 3
        * Another sub

    More regular text
  */})

  logger(md)
  //runner(t, md, tokens)
})