var choo = require('choo')
var html = require('choo/html')
var nanocrane = require('..')

var content = {
  '/': { title: 'home' },
  '/about': { title: 'about' }
}
var html = `
<html>
  <head>
    <title><!-- @title --></title>
    <script>window.initialState = '<!-- @state -->'</script>
  </head>
  <!-- @content -->
</html>
`

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

nanocrane(app.mount('body'), { content: content }, html, {
  verbose: true
})
