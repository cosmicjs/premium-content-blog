import { Component } from 'react'
import Cosmic from 'cosmicjs'
import async from 'async'
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
    }
  }

  fetchData() {
    this.getRevenue();this.getUsers();this.getCancellations()
  }

  componentDidMount() {
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, 60000)
  }

  getRevenue(cosmic) {
    this.setState({ fetchingRevenue: true})
    async.series([
      callback => {
        Cosmic.getObject(this.state.cosmic, { slug: 'subscriptions' }, (err, response) => {
          callback(null, response.object)
        })
      },
      callback => {
        Cosmic.getObjectType(this.state.cosmic, { type_slug: 'users' }, (err, response) => {
          callback(null, response.objects.all)
        })
      }
    ], (err, results) => {
      let subscriptions = results[0], users = results[1];
      let currentStats = this.state.stats
      currentStats.revenue = formatter.format(users.map(user =>
        parseInt(subscriptions.metadata[`${user.metadata.subscription_type}_price`].replace('$', ''))
      )
      .reduce((sum, val) => sum + val))
      this.setState({ stats: currentStats })
      this.setState({ fetchingRevenue: false })
    })
  }

  getUsers(cosmic) {
    this.setState({ fetchingUsers: true })
    Cosmic.getObjectType(this.state.cosmic, { type_slug: 'users' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.users = 'Error'
        this.setState({ stats: currentStats })
      } else {
        let currentStats = this.state.stats
        currentStats.users = isNaN(response.total) ? 0 : response.total
        this.setState({ stats: currentStats })
        this.setState({ users: response.objects.all })
        this.setState({ fetchingUsers: false })
      }
    })
  }

  getCancellations(cosmic) {
    this.setState({ fetchingCancellations: true})
    Cosmic.getObject(this.state.cosmic, { slug: 'subscriptions' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.users = 'Error'
        this.setState({ stats: currentStats })
      } else {
        let currentStats = this.state.stats
        currentStats.cancellations = isNaN(response.object.metadata.cancellations) ? 0: response.object.metadata.cancellations
        this.setState({ stats: currentStats })
        this.setState({ fetchingCancellations: false })
      }
    })
  }

  render() {
    return (
      <div className="container">
        <Loader loadingState={this.state.fetchingUsers || this.state.fetchingRevenue || this.state.fetchingCancellations} />
        <StatsContainer stats={this.state.stats} />
        <UserList users={this.state.users}/>
      </div>
    )
  }
}
