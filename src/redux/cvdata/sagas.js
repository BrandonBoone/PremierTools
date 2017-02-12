import { call, put, takeLatest, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {
  CVDATA_REQUESTED,
} from './constants';
import {
  cvDataFailed,
  cvDataSuccess,
} from './actions';
import {
  getDates,
} from '../dateRange/reducer';
import {
  getJewelerId
} from '../jeweler/reducer';
import csv from 'csv';
import getMonth from 'date-fns/get_month';

function getData(startDate, endDate, endDate2, id) {
  console.log(`https://opal.premierdesigns.com/reports/rwservlet?keyProd+report=cvcsvd.rdf+desformat=delimiteddata+delimiter=,+destype=cache+p_cust_no=${id}+p_begin_date=${startDate}+p_end_date=${endDate}+p_end_date2=${endDate2}`);
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest ({ // eslint-disable-line
      method: 'GET',
      url: `https://opal.premierdesigns.com/reports/rwservlet?keyProd+report=cvcsvd.rdf+desformat=delimiteddata+delimiter=,+destype=cache+p_cust_no=${id}+p_begin_date=${startDate}+p_end_date=${endDate}+p_end_date2=${endDate2}`,
      onload: ({ responseText }) => {
        const index = responseText.indexOf("COMMISSION");

        resolve(responseText.substring(index));
      },
      onerror: () => reject()
    });
  });
}

function parse(csvData) {
  return new Promise((resolve, reject) => {
    csv.parse(csvData, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function transform(data) {
  if(!data || data.length === 0){
    return null;
  }
  const keys = data.shift();
  return data.map((row) =>
    row.reduce((prev, next, i) => {
      prev[keys[i]] = next;
      return prev;
    }, {})
  );
}

const types = {
  HOME_SHOW: 1,
  WHOLESALE_PURCHASE: 2,
  INITIAL_WHOLESALE_PURCHASE: 5,
  CATALOG_PURCHASE: 7,
  NEW_JEWELER: 17,
  SAMPLE_PURCHASE: 18,
  NO_ORDERS: 0,
}

function computeJewelerData(data, jewelerId){
  return data.reduce(function(prev, next) {
    // Get the jeweler by name. If they have already been counted, then don't increment jewelerCount
    prev.jewelerCount += !prev[next.NAME] ? 1 : 0;
    // Init a new jeweler or copy the existing one.
    prev[next.NAME] = prev[next.NAME] || { totalProfit: 0, totalRetail: 0, parties: {}, counted: {} };

    // reference the jeweler
    var jeweler = prev[next.NAME];
    // Get the month as a number
    var month = getMonth(next.DATE) + 1;

    // If the month hasn't been initialized yet. Set default values
    prev.month[month] = prev.month[month] || { retail: 0, newJewelers: 0, parties: 0 };

    // Get the commission paid
    var commission = parseFloat(next["COMM PAID"], 10) || 0;

    // var percentage = parseInt(next["COMM%"], 10) || 0;
    var retail = parseFloat(next["TOT RETAIL"], 10) || 0;

    // Add the commission paid to the current retail for the current month
    prev.month[month].retail += commission;

    // Increment the number of new jewelers for the current month (17 === new jeweler)
    prev.month[month].newJewelers += next.TYPE == types.NEW_JEWELER ? 1 : 0; // eslint-disable-line eqeqeq

    // Increment the totalProfit for the jeweler (profit for the upline)
    jeweler.totalProfit += commission;

    // Increment the total retail for the jeweler
    jeweler.totalRetail += retail;
    
    // Some items appear more then once. Make sure we're only counting parties one time.
    if (!jeweler.counted[next["FORM NO."]]) {
        // Mark this entry as counted
        jeweler.counted[next["FORM NO."]] = true;

        // Count the types of parties (entries) for the jeweler
        jeweler.parties[next.TYPE] = (jeweler.parties[next.TYPE] || 0) + 1;

        // Incrememt the number of parties for the month
        prev.month[month].parties += (
          next.TYPE == types.HOME_SHOW || // eslint-disable-line eqeqeq
          next.TYPE == types.CATALOG_PURCHASE // eslint-disable-line eqeqeq
        ) ? 1 : 0;
    }

    // Increment the overall (total) commission going to the upline
    prev.totalCommission += commission;

    // Increment the total retail
    prev.totalRetail += retail;

    return prev;
  }, { totalCommission: 0, totalRetail: 0, month: { }, jewelerCount: 0 });
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function computeMonthData(data) {
  return Object.keys(data.month).map(key => ({
    month: getMonthName(key),
    parties: data.month[key].parties,
    retail: round(data.month[key].retail, 2),
  }));
}

function getMonthName(number) {
  return {
      1: 'Jan',
      2: 'Feb',
      3: 'Mar',
      4: 'Apr',
      5: 'May',
      6: 'Jun',
      7: 'Jul',
      8: 'Aug',
      9: 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dec'
  }[number];
}

// avoid pounding the premier server.
// TODO: the delay's are being created at the same time, may need gradual escalation. 
function* delayedCall(startDate, endDate, endDate2, id, time) {
  yield call(delay, time);
  return yield call(getData, startDate, endDate, endDate2, id);
}

function* getCvData() {
  try {
    let time = 50; 
    const { id } = yield select(getJewelerId);
    const dates = yield select(getDates);
    const results = yield dates.map(set => {
      time += 50;
      return call(delayedCall, set.startDate, set.endDate, set.endDate2, id, time);
    });
    const parsed = yield results.map(result => call(parse, result));
    const json = parsed.reduce((prev, next) => [...prev, ...transform(next)], []);
    const jewelerData = computeJewelerData(json, id); 
    yield put(cvDataSuccess(computeMonthData(jewelerData)));
  } catch (e) {
    yield put(cvDataFailed(e.message));
  }
}

export function* watchCvRequested() {
  yield takeLatest(CVDATA_REQUESTED, getCvData);
}
