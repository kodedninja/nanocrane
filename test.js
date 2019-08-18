var test = require('tape')
var tapePromise = require('tape-promise').default
var crane = require('.')
var choo = require('choo')

var testPromise = tapePromise(test)

testPromise('arguments are required', async function (t) {
  t.plan(5)

  var app = getApp()

  await t.rejects(crane, 'without arguments')
  await t.rejects(crane.bind(undefined, {}, { content: {} }, ''), 'with incorrect app')
  await t.rejects(crane.bind(undefined, app, 5, ''), 'with incorrect state')
  await t.rejects(crane.bind(undefined, app, {}, ''), 'without content in state')
  await t.rejects(crane.bind(undefined, app, { content: {} }, 5), 'with incorrect html')
})

function getApp () {
  var app = choo()

  app.route('*', function (state, emit) {
    return html`
      <body>
        <div>${state.content[state.href || '/'].title}</div>
      </body>
    `
  })

  return app.mount('body')
}
