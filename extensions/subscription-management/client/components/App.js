import { Component } from 'react'
import Header from './Header'
import SubscriberContainer from './SubscriberData/SubscriberContainer'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic
    }
  }

  render() {
    return (
      <div>
        <Header
          bucket={this.state.cosmic.bucket.slug} />
        <SubscriberContainer
          cosmic={this.state.cosmic} />
      </div>
    )
  }
}
