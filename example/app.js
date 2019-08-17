var choo = require('choo')
var html = require('choo/html')

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

module.exports = app.mount('body')
