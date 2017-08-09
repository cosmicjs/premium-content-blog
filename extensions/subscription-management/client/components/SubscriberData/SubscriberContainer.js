import { Component } from 'react'
import Cosmic from 'cosmicjs'
import axios from 'axios'
import _ from 'lodash'
import StatsContainer from './StatsContainer'
import Loader from './Loader'
import UserList from './UserList'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic,
      stats: {
        revenue: 'Loading...',
        users: 'Loading...',
        cancellations: 'Loading...'
      },
      users: [],
      fetchingRevenue: true,
      fetchingUsers: true,
      deletingUser: false,
    }
    this.deleteUser = this.deleteUser.bind(this)
  }

  fetchData() {
    this.getRevenue();this.getUsers();this.getCancellations()
  }

  deleteUser(e, user_slug, stripe_id) {
    Cosmic.getObject(this.state.cosmic, { slug: 'site' }, (err, response) => {
      axios.post(`http://${response.object.metadata.domain}/api?write_key=${this.state.cosmic.bucket.write_key}&query=deleteUser&customer=${stripe_id}`)
        .then( (axResponse) => {
          Cosmic.deleteObject(this.state.cosmic, { write_key: this.state.cosmic.bucket.write_key, slug: user_slug }, (err, delResponse) => {
            console.log(delResponse)
            this.setState({ users: _.remove(this.state.users, user => user.slug !== user_slug)})
          })
        })
    })
  }

  componentDidMount() {
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, 60000)
  }

  getRevenue(cosmic) {
    this.setState({ fetchingRevenue: true})
    Cosmic.getObject(this.state.cosmic, { slug: 'site' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.revenue = 'Error'
        this.setState({ stats: currentStats })
      }
      axios.get(`http://${response.object.metadata.domain}/api?read_key=${this.state.cosmic.bucket.read_key}&query=revenue`)
        .then(axResponse => {
          let currentStats = this.state.stats
          currentStats.revenue = formatter.format(axResponse.data.data/100.0)
          this.setState({ stats: currentStats })
          this.setState({ fetchingRevenue: false })
        })
    })
  }

  getUsers(cosmic) {
    this.setState({ fetchingUsers: true })
    Cosmic.getObjectType(this.state.cosmic, { type_slug: 'users' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.users = 'Error'
        this.setState({ stats: currentStats })
      }
      let currentStats = this.state.stats
      currentStats.users = isNaN(response.total) ? 0 : response.total
      this.setState({ stats: currentStats })
      this.setState({ users: response.objects.all })
      this.setState({ fetchingUsers: false })
    })
  }

  getCancellations(cosmic) {
    this.setState({ fetchingRevenue: true})
    Cosmic.getObject(this.state.cosmic, { slug: 'site' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.cancellations = 'Error'
        this.setState({ stats: currentStats })
      }
      axios.get(`http://${response.object.metadata.domain}/api?read_key=${this.state.cosmic.bucket.read_key}&query=cancellations`)
        .then(axResponse => {
          let currentStats = this.state.stats
          currentStats.cancellations = axResponse.data.data
          this.setState({ stats: currentStats })
          this.setState({ fetchingCancellations: false })
        })
    })
  }

  render() {
    return (
      <div className="container">
        <Loader loadingState={this.deletingUser || this.state.fetchingUsers || this.state.fetchingRevenue || this.state.fetchingCancellations} />
        <StatsContainer stats={this.state.stats} />
        <UserList deleteUser={this.deleteUser} users={this.state.users}/>
      </div>
    )
  }
}
