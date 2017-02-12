import { connect } from 'react-redux';
import MonthlyPartyProfitChart from '../components/MonthlyPartyProfitChart.jsx';
import { getWidth } from '../../../redux/browser/selectors';

const mapStateToProps = state => ({
  data: state.cvdata.months,
  width: getWidth(state),
});

const MonthlyCommissionsAndParties = connect(mapStateToProps)(MonthlyPartyProfitChart);

export default MonthlyCommissionsAndParties;
