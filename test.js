var tape = require('tape')
var tapePromise = require('tape-promise').default
var mock = require('mock-fs')
var choo = require('choo')
var html = require('choo/html')
var fs = require('fs')
var path = require('path')
var crane = require('.')

var test = tapePromise(tape)

test('arguments are required', async function (t) {
  t.plan(5)

  var app = getApp()

  await t.rejects(crane, 'without arguments')
  await t.rejects(crane.bind(undefined, {}, { content: {} }, ''), 'with incorrect app')
  await t.rejects(crane.bind(undefined, app, 5, ''), 'with incorrect state')
  await t.rejects(crane.bind(undefined, app, {}, ''), 'without content in state')
  await t.rejects(crane.bind(undefined, app, { content: {} }, 5), 'with incorrect html')
})

test('ensures output directory exists', async function (t) {
  t.plan(1)

  var app = getApp()
  var outputPath = './public'

  // mock fs
  mock({})

  await crane(app, { content: {} }, '')

  t.equals(fs.existsSync(outputPath), true, 'output directory exists')

  // restore fs
  mock.restore()
})

test('cleans and re-creates output directory', async function (t) {
  t.plan(2)

  var app = getApp()
  var outputPath = './public'

  // mock fs
  mock({
    public: {
      'text.txt': 'hello world'
    }
  })

  // call nanocrane with an empty content object
  await crane(app, { content: {} }, '')

  t.equals(fs.existsSync(outputPath), true, 'output directory exists')
  t.equals(fs.existsSync(path.join(outputPath, 'test.txt')), false, 'output directory was cleaned')

  // restore fs
  mock.restore()
})

test('generates correct directory structure', async function (t) {
  t.plan(4)

  var app = getApp()

  mock({})

  var content = {
    '/': { title: 'home' },
    '/blog': { title: 'blog' },
    '/blog/entry': { title: 'entry' },
    '/blog/another': { title: 'another entry' }
  }

  await crane(app, { content: content }, '')

  t.equals(fs.existsSync(path.join('./public', 'index.html')), true, 'index.html exists')
  t.equals(fs.existsSync(path.join('./public', 'blog', 'index.html')), true, 'blog/index.html exists')
  t.equals(fs.existsSync(path.join('./public', 'blog', 'entry', 'index.html')), true, 'blog/entry/index.html exists')
  t.equals(fs.existsSync(path.join('./public', 'blog', 'another', 'index.html')), true, 'blog/another/index.html exists')

  mock.restore()
})

test('generates correct html', async function (t) {
  t.plan(3)

  var app = getApp()

  mock({})

  var content = {
    '/': { title: 'home' }
  }
  var html = `
    <title><!-- @title --></title>
    <!-- @state -->
    <!-- @content -->
  `
  var state = `window.initialState={"events":{"DOMCONTENTLOADED":"DOMContentLoaded","DOMTITLECHANGE":"DOMTitleChange","REPLACESTATE":"replaceState","PUSHSTATE":"pushState","NAVIGATE":"navigate","POPSTATE":"popState","RENDER":"render"},"components":{},"content":{"/":{"title":"home"}},"cache":null,"href":"","query":{},"route":"*","params":{"wildcard":""},"title":"home"}`

  await crane(app, { content: content }, html)

  var result = fs.readFileSync('./public/index.html', 'utf8')

  t.equals(result.includes('<title>home</title>'), true, 'title included')
  t.equals(result.includes(state), true, 'state included')
  t.equals(result.includes('<div>home</div>'), true, 'content included')

  mock.restore()
})

test('options.output', async function (t) {
  t.plan(1)

  var app = getApp()

  mock({})

  await crane(app, { content: {} }, '', {
    output: './build'
  })

  t.equals(fs.existsSync('./build'), true, './build exists')

  mock.restore()
})

test('options.copy', function (t) {
  t.plan(1)
  t.pass('TO IMPLEMENT')
})

function getApp () {
  var app = choo()

  app.route('*', function (state, emit) {
    var page = state.content[state.href || '/']
    emit(state.events.DOMTITLECHANGE, page.title)
    return html`
      <body>
        <div>${page.title}</div>
      </body>
    `
  })

  return app.mount('body')
}
