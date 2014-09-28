# md-parser

## Example

Currently:

```js
var mdparse = require("md-parser")
var multiline = require("multiline")
var concat = require("concat-stream")

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

var parse = mdparse()

parse.pipe(concat(function (data) {
  console.log(data)
}))

parse.write(md)
parse.end()
```

Outputs:

```html
<h1>Heading 1
</h1>
<p>Some <em>italic</em> and <strong>bold</strong> in the title</p>
<p><strong>and</strong> also in some <em>text</em>
</p>
<h2>Heading 2
  </h2>
<p>Some more text
</p>
<h3> Heading 3</h3>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit
</p>
<ul><li> Bullet 1
    <ul><li> Sub bullet 1</li>
    <li> Sub bullet 2</li></ul></li></ul>
<ul><li> Third</li>
<li> Third <em>2</em>
    <ul><li> Sub bullet 3</li></ul></li></ul>
<ul><li> Bullet 2</li>
<li> Bullet 3
    <ul><li> Another sub</li></ul></li></ul>
<p>More regular text</p>
```