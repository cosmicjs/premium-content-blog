import StatTicker from './StatTicker'

const StatsContainer = ({ stats }) =>
  <div className="row">{Object.keys(stats).map((key, index) =>
      <div key={index} className="col-md-4 text-center"><StatTicker name={key} value={stats[key]} /></div>
    )}
  </div>


export default StatsContainer
