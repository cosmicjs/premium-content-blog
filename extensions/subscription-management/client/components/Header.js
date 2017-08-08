const Header = ({ bucket, stripeKey }) =>
  <nav className="navbar navbar-default">
    <div className="container-fluid">
      <ul className="nav navbar-nav">
        <li className="navbar-text"><strong>Managing Subscriptions for: </strong><em>{bucket}</em></li>
      </ul>
      <ul className="nav navbar-nav navbar-right">
        <li className="navbar-text"><strong>Stripe Public Key: </strong><em>{stripeKey}</em></li>
      </ul>
    </div>
  </nav>

export default Header
