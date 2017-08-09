import ReactLoading from 'react-loading'

const Loader = ({ loadingState }) =>
  <div className="row" style={{display: loadingState ? 'block' : 'none' }}>
    <div className="col-xs-12">
      <div className="pull-right">
        <ReactLoading height='20px' width='20px' type="spin" color="#444" />
      </div>
    </div>
  </div>

export default Loader
