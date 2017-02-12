import React from 'react';
import MonthlyCommissionsAndParties from './modules/charts/containers/MonthlyCommissionsAndParties.jsx';
import TitleLine from './modules/common/components/TitleLine.jsx';
import Header from './modules/common/components/Header.jsx';
import RunButton from './modules/common/containers/RunButton';
import CVDateRangePicker from './modules/common/containers/CVDateRangePicker';
import { connect } from 'react-redux';
import { getWidth } from './redux/browser/selectors';
import Ripple from './ripple.svg';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import './App.css';

const style = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  width: '100%',
};

const App = ({ isLoading, width }) => (
  <div
    style={style}
  >
    <div>
      <CVDateRangePicker />
      <RunButton />
    </div>
    <ReactCSSTransitionGroup
      transitionName="commissionReports"
      transitionAppear={true}
      transitionAppearTimeout={500}
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
    >
    {isLoading ? 
      <div 
        style={{
          height:'500px',
        }}
      >
        <Ripple key="loading" />
      </div>
      :
      <div
        key="charts"
        style={{
          width
        }}
      >
        <Header
          title="Commissions By Month"
        />
        <TitleLine />
        <p>
          This chart shows the total commissions and total parties of your downline by month.
        </p>
        <p>
          <i>Only "Home Shows" and "Catalog Orders" are counted as parties</i>
        </p>
        <MonthlyCommissionsAndParties />
      </div>
    }
    </ReactCSSTransitionGroup>
  </div>
);


export default connect(
  state => ({
    isLoading: state.cvdata.loading,
    width: getWidth(state),
  })
)(App);
