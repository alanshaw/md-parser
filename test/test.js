var test = require("tape")
var multiline = require("multiline")
var logger = require("./util/logger")
//var runner = require("./util/runner")

test("parse", function (t) {
  var md = multiline.stripIndent(function () {/*
    # Heading 1
    Some *italic* and __bold__ in the title
    **and** also in some _text_
  */})

  logger(md)
  //runner(t, md, tokens)
})