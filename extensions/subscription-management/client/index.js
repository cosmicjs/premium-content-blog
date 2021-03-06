import React from 'react'
import ReactDom from 'react-dom'
import App from './components/App'
import QueryString from 'query-string'

window.React = React
const url = QueryString.parse(location.search)

const cosmic = { bucket: {
    slug: url.bucket_slug,
    write_key: url.write_key,
    read_key: url.read_key
  }
}

ReactDom.render(
  <App cosmic={cosmic}/>,
  document.getElementById('root')
)
