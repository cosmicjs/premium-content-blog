import { Component } from 'react'
import cosmic from 'cosmicjs'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic,
      loading: true
    }
    this.getRevenue = this.getRevenue.bind(this)
  }

  componentWillMount() {
    this.state.revenue = this.getRevenue(this.state.stripe)
  }

  compontentDidMount() {
    this.state.loading = false
  }

  getRevenue(readKey) {

  }

  render() {
    return (
      <div>{this.loading ? "Loading..." : "Loaded."}</div>
    )
  }
}
