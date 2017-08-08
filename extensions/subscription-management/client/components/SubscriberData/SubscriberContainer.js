import { Component } from 'react'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic,
      stripe: Stripe(this.props.stripeKey),
      loading: true
    }
    this.getRevenue = this.getRevenue.bind(this)
  }

  componentWillMount() {
    this.state.revenue = this.getRevenue(this.state.stripe)
    console.log(this.state.revenue)
    this.state.loading = false
  }

  getRevenue(stripe) {
    stripe.charges.list((err, charges) => {
      let amounts = charges.data.map((charge) => {
        return charge.amount
      })
      return amounts.reduce((sum, val) => {
        return sum + value
      })
    })
  }

  render() {
    return (
      this.state.loading ?
        "Loading..." :
        "Loaded."
    )
  }
}
