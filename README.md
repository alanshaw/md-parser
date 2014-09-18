# md-parser

## Example

Currently:

```js
var mdparse = require("md-parser")
var multiline = require("multiline")
var concat = require("concat-stream")

var md = multiline.stripIndent(function () {/*
  # Heading 1
  Some *italic* and __bold__ in the title
  **and** also in some _text_
  ## Heading 2
  Some more text
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
<h1> Heading 1</h1>
<p>Some <em>italic</em> and <strong>bold</strong> in the title</p>
<p><strong>and</strong> also in some <em>text</em></p>
<h2> Heading 2</h2>
<p>Some more text</p>
```