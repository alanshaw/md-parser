var test = require("tape")
var multiline = require("multiline")
var logger = require("./util/logger")
//var runner = require("./util/runner")

test("parse", function (t) {
  var md = multiline.stripIndent(function () {/*
    Markdown Ipsum Presents
    =======================

    **Pellentesque habitant morbi tristique** senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. _Aenean ultricies mi vitae est_. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, `commodo vitae`, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum  rutrum orci, sagittis tempus lacus enim ac dui. [Donec non enim](#) in turpis pulvinar facilisis. Ut felis.

    Header Level 2
    --------------

      1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
      2. Aliquam tincidunt mauris eu risus.


    > Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur  massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.

    ### Header Level 3

      * Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
      * Aliquam tincidunt mauris eu risus.

    ```
    #header h1 a {
      display: block;
      width: 300px;
      height: 80px;
    }
    ```
  */})

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

  logger(md)
  //runner(t, md, tokens)
})