var nanocrane = require('..')
var app = require('./app')

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

nanocrane(app, { content: content }, html, {
  verbose: true
})
