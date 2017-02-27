import { connect } from 'react-redux';
import DateRangePicker from '../components/DateRangePicker.jsx';
import {
  dateRangeChanged,
} from '../../../redux/dateRange/actions';
import {
  cvDataRequested,
} from '../../../redux/cvdata/actions';

const mapStateToProps = state => ({
  from: state.dateRange.from,
  to: state.dateRange.to,
  title: 'Choose a range of months',
});

const CVDateRangePicker = connect(
  mapStateToProps,
  {
    dateChanged: dateRangeChanged,
    onDismiss: cvDataRequested,
  }
)(DateRangePicker);

export default CVDateRangePicker;
