const UserList = ({ users, deleteUser }) =>
  <div style={{marginTop: 50 + 'px'}} className="row">
    <div className="col-xs-12">
      <h4 className="pull-left lead">All Users:</h4>
      <table className="table table-responsive table-hover">
        <thead>
          <tr>
            <th>Stripe ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) =>
            <tr key={index}>
              <td>{user.metadata.stripe_id}</td>
              <td>{user.metadata.first_name}</td>
              <td>{user.metadata.last_name}</td>
              <td>{user.metadata.email}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>


export default UserList
