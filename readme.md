# nanocrane
<a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
  <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square" alt="Stability"/>
</a>
<a href="https://www.npmjs.com/package/nanocrane">
  <img src="https://img.shields.io/npm/v/nanocrane.svg?style=flat-square" alt="NPM version"/>
</a>

Versatile static-site builder library for [Choo](https://github.com/choojs/choo).

Merges an exported Choo application + a content object + an HTML string and outputs a set of static HTML files.

## Installation
```
npm i nanocrane
```

## Example

```javascript
var app = require('./index.js')
var nanocrane = require('..')

var content = {
  '/': { title: 'home' },
  '/about': { title: 'about' }
}
var template = `
<html>
  <head>
    <title><!-- @title --></title>
    <!-- @state -->
  </head>
  <!-- @content -->
</html>
`

nanocrane(app, { content: content }, template)
```

## Usage

### `nanocrane(app, content, htmlString, options)`

`app` is a mounted Choo application, `content` is an object, `htmlString` is the template of the outputted HTML files.

It accepts the content to follow [`nanocontent`](https://github.com/jondashkyle/nanocontent)'s basic structure.

In the template it'll replace the following:

- `<!-- @content -->` ― with the HTML output of the app
- `<!-- @state -->` ― with a script element that sets the initial state for Choo
- `<!-- @title -->` ― with the title of the current page

Options:
```
{
  output: string path,
  copy: array of string paths,
  verbose: bool
}
```
