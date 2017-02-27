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
import floor from 'lodash/floor';

const style = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  width: '100%',
};

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const App = ({
  isLoading,
  width,
  errorMessage,
  totalRetail,
  totalCommission,
  totalCommissionVolume,
  totalBonusPaid
}) => (
  <div
    className='commissionReports'
    style={style}
  >
    <div>
      <CVDateRangePicker />
    </div>
    <ReactCSSTransitionGroup
      transitionName="commissionReports"
      transitionAppear={true}
      transitionAppearTimeout={300}
      transitionEnterTimeout={300}
      transitionLeaveTimeout={300}
    >
    {errorMessage ? 
      <span style={{color:'red'}}>
        Oops! Something went terribly wrong. Let us known&nbsp;
        <a href="https://github.com/BrandonBoone/PremierTools/issues">here</a>
      </span> : null
    }
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
        <p style={{ fontSize: '1.3em' }}><strong>{formatter.format(totalCommission.total + totalBonusPaid)}</strong>: This is what your downline made you.</p>

        <h5>Breakdown</h5>
        <table>
          <tbody>
            {Object.keys(totalCommissionVolume.percentages).map(next =>
              <tr>
                <td><abbr title="commission volume">CV</abbr></td>
                <td>{formatter.format(floor(totalCommissionVolume.percentages[next] * (parseFloat(next,10)/100),2))}</td>
                <td>({next}% of {formatter.format(totalCommissionVolume.percentages[next])})</td>
              </tr>
            )}
            <tr>
              <td>Bonus</td><td>{formatter.format(totalBonusPaid)}</td><td></td>
            </tr>
            <tr>
              <td>Total Commission</td><td><strong>{formatter.format(totalCommission.total + totalBonusPaid)}</strong></td><td></td>
            </tr>
            <tr>
              <td><i>Total Retail</i></td><td><i>{formatter.format(totalRetail)}</i></td><td></td>
            </tr>
          </tbody>
        </table>
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
    errorMessage: state.cvdata.errorMessage,
    totalCommission: state.cvdata.totalCommission,
    totalRetail: state.cvdata.totalRetail,
    totalCommissionVolume: state.cvdata.totalCommissionVolume,
    totalBonusPaid: state.cvdata.totalBonusPaid,
  })
)(App);
