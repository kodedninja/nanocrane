var assert = require('assert')
var decode = require('parse-entities')
var path = require('path')
var fs = require('fs')
var ncp = promisify(require('ncp'))
var rmrf = promisify(require('rimraf'))
var minify = require('html-minifier').minify

var PATTERN_STATE = '<!-- @state -->'
var PATTERN_CONTENT = '<!-- @content -->'
var PATTERN_TITLE = '<!-- @title -->'

module.exports = async function (app, extendState, htmlTemplate, options) {
  assert(typeof app.state === 'object', 'nanocrane: app must be a choo app')
  assert(typeof extendState === 'object', 'nanocrane: content must be an object')
  assert(typeof htmlTemplate === 'string', 'nanocrane: html must be a string')

  options = Object.assign({
    clear: true,
    copy: [],
    output: path.join(process.cwd(), './public'),
    outputRoute: writeRoute,
    verbose: false
  }, options)

  assert(typeof extendState.content === 'object', 'nanocrane: extendState.content must be an object')

  // clear and ensure output directory
  if (options.clear) {
    await rmrf(options.output)
  }
  ensure(options.output)

  Object.keys(extendState.content).map(function (route) {
    var state = Object.assign(app.state, extendState)

    var rendered = app.toString(route, state)
    var html = decorate(htmlTemplate, state, rendered)

    if (process.env.NODE_ENV === 'production') {
      html = minify(html, {
        minifyJS: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        removeComments: true
      })
    }

    options.outputRoute(route, html, options)
    if (options.verbose) console.log(`built ${route}`)
  })

  // copy directories
  options.copy.map(async function (srcPath) {
    var destPath = `${options.output}/${path.basename(srcPath)}`
    try {
      await ncp(srcPath, destPath)
      if (options.verbose) console.log(`copied ${srcPath}`)
    } catch (err) {
      console.error(`ERR: could not copy ${srcPath}`)
    }
  })
}

// default output behaviour: write to output folder
function writeRoute (route, html, options) {
  var outputPath = path.join(options.output, route)
  ensure(outputPath)
  fs.writeFileSync(path.join(outputPath, 'index.html'), html)
}

// replace patterns in the html template
// (str, obj, str) -> str
function decorate (template, state, rendered) {
  return template
    .replace(PATTERN_CONTENT, decode(rendered))
    .replace(PATTERN_STATE, `<script>window.initialState=${JSON.stringify(state)}</script>`)
    .replace(PATTERN_TITLE, state.title)
}

// (fn) -> fn
function promisify (fn) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      fn(...args, function (err) {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
}

// ensures directory exists
function ensure (path) {
  !fs.existsSync(path) && fs.mkdirSync(path)
}
