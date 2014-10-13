var test = require("tape")
var multiline = require("multiline")
var logger = require("./util/logger")
//var runner = require("./util/runner")

test("parse", function (t) {
  var md = multiline.stripIndent(function () {/*
    # Heading 1
    Some text *italics* foo
    * List Item
        * Sub list item
        * foo bar
    * List Item 2
    Some other text
  */})

  logger(md)
  //runner(t, md, tokens)
})