const Header = ({ bucket }) =>
  <nav className="navbar navbar-default">
    <div className="container-fluid">
      <ul className="nav navbar-nav">
        <li className="navbar-text"><strong>Managing Subscriptions for: </strong><em>{bucket}</em></li>
      </ul>
    </div>
  </nav>

export default Header
