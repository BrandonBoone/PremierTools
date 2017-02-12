import { connect } from 'react-redux';
import Button from '../components/Button.jsx';
import {
  cvDataRequested,
} from '../../../redux/cvdata/actions';

const mapStateToProps = state => ({
  value: 'Run',
});

const RunButton = connect(
  mapStateToProps,
  {
    onClick: cvDataRequested,
  }
)(Button);

export default RunButton;
