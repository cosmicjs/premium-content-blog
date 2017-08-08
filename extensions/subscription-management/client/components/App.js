import { Component } from 'react'
import Header from './Header'
import SubscriberContainer from './SubscriberData/SubscriberContainer'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic,
      stripeKey: this.props.stripeKey
    }
  }

  render() {
    return (
      <div>
        <Header
          bucket={this.state.cosmic.bucket}
          stripeKey={this.state.stripeKey}/>
        <SubscriberContainer
          cosmic={this.state.cosmic}
          stripeKey={this.state.stripeKey} />
      </div>
    )
  }
}
