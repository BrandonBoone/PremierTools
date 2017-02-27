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
import {
  getCachedData,
  setCachedData,
} from './storage';
import differenceInMonths from 'date-fns/difference_in_months';
import round from 'lodash/round';

const getData = (startDate, endDate, endDate2, id) =>
  new Promise((resolve, reject) => {
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

const parse = ({ raw, cache, key, shouldCache }) =>
  new Promise((resolve, reject) => {
    if (cache) {
      resolve(cache);
      return;
    }

    csv.parse(raw, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      if(shouldCache) {
        setCachedData(key, data);
      }
      resolve(data);
    });
  });

const transform = data => {
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

const columns = {
  commPaid: "COMM PAID",
  commVolume: "COMM VOLUME",
  totRetail: "TOT RETAIL",
  formNo: "FORM NO.",
  commLevel: "COMMISSION LEVEL",
  type: "TYPE",
  bonus: "BONUS%",
  commPer: "COMM%",
};

const computeJewelerData = (data, jewelerId) =>
  data.reduce(function(prev, next) {
    // Get the jeweler by name. If they have already been counted, then don't increment jewelerCount
    prev.jewelerCount += !prev[next.NAME] ? 1 : 0;
    // Init a new jeweler or copy the existing one.
    prev[next.NAME] = prev[next.NAME] || { totalProfit: 0, totalRetail: 0, parties: {}, counted: {} };

    // reference the jeweler
    let jeweler = prev[next.NAME];
    // Get the month as a number
    let month = getMonth(next.DATE) + 1;

    // If the month hasn't been initialized yet. Set default values
    prev.month[month] = prev.month[month] || { retail: 0, newJewelers: 0, parties: 0 };

    // Get the commission paid
    let commission = 0;
    let bonus = 0;
    let percentage = 0;

    // bonus records are duplicate entries.
    if (next[columns.bonus]) {
      bonus = parseFloat(next[columns.commPaid], 10) || 0;
    } else {
      commission = parseFloat(next[columns.commPaid], 10) || 0;
      percentage = parseFloat(next[columns.commPer], 10) || 0;
    }

    let commissionVolume = parseFloat(next[columns.commVolume], 10) || 0;
    
    // var percentage = parseInt(next["COMM%"], 10) || 0;
    let retail = parseFloat(next[columns.totRetail], 10) || 0;

    // Add the commission paid to the current retail for the current month
    prev.month[month].retail += commission;

    // Increment the number of new jewelers for the current month (17 === new jeweler)
    prev.month[month].newJewelers += next.TYPE == types.NEW_JEWELER ? 1 : 0; // eslint-disable-line eqeqeq

    // Increment the totalProfit for the jeweler (profit for the upline)
    jeweler.totalProfit += commission;

    // Increment the total retail for the jeweler
    jeweler.totalRetail += retail;
    
    // Some items appear more then once. Make sure we're only counting parties one time.
    if (!jeweler.counted[next[columns.formNo]]) {
        // Mark this entry as counted
        jeweler.counted[next[columns.formNo]] = true;

        // Count the types of parties (entries) for the jeweler
        jeweler.parties[next.TYPE] = (jeweler.parties[next.TYPE] || 0) + 1;

        // Incrememt the number of parties for the month
        prev.month[month].parties += (
          next.TYPE == types.HOME_SHOW || // eslint-disable-line eqeqeq
          next.TYPE == types.CATALOG_PURCHASE // eslint-disable-line eqeqeq
        ) ? 1 : 0;
    }

    // Increment the overall (total) commission going to the upline
    // prev.totalCommission += commission;
    prev.totalCommission.total += commission;
    prev.totalCommission.percentages[percentage] = round((prev.totalCommission.percentages[percentage] || 0) + commission, 2);



    if(parseInt(next[columns.commLevel], 10) > 0 && commission != 0) { // eslint-disable-line eqeqeq
      prev.commissionVolume.total += commissionVolume;
      prev.commissionVolume.percentages[percentage] = round((prev.commissionVolume.percentages[percentage] || 0) + commissionVolume, 2);
    }

    if(parseInt(next[columns.commLevel], 10) > 0) {
      // Increment the total retail
      prev.totalRetail += retail;
    }

    prev.totalBonusPaid += bonus;

    return prev;
  }, { totalCommission: { total: 0, percentages: {}, }, totalBonusPaid: 0, commissionVolume: { total: 0, percentages: {}, }, totalRetail: 0, month: { }, jewelerCount: 0 });

const monthNames = {
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
};

const computeMonthData = month => 
  Object.keys(month).map(key => ({
    month: monthNames[key],
    parties: month[key].parties,
    retail: round(month[key].retail, 2),
  }));


// avoid pounding the premier server.
function initDelayedCall() {
  let time = 50;
  return function* ({ startDate, endDate, endDate2, id, key, shouldCache }) {
    const cache = yield call(getCachedData, key);
    if (cache) {
      return {
        cache,
        key,
        shouldCache,
      };
    } 
    yield call(delay, time);
    time += 500;
    return {
      raw: yield call(getData, startDate, endDate, endDate2, id),
      key,
      shouldCache,
    };
  }
}

function* getCvData() {
  try {
    // get the jeweler's id
    const { id } = yield select(getJewelerId);
    // get the date ranges for each report month
    const dates = yield select(getDates);
    // get the reports
    const results = yield dates.map(({ startDate, endDate, endDate2 }) => {
      const delayedCall = initDelayedCall();
      const key = `id_${startDate}${endDate}${endDate2}${id}`;
      const difference = differenceInMonths(new Date(), endDate);
      // don't cache recent reports in case they change.
      const shouldCache = difference >= 2;
      return call(delayedCall, { startDate, endDate, endDate2, id, key, shouldCache });
    });
    // parse the results
    const parsed = yield results.map(result => call(parse, result));
    // convert to JSON
    const json = parsed.reduce((prev, next) => [...prev, ...transform(next)], []);
    // convert to chartable data.
    const { month, totalCommission, totalRetail, commissionVolume, totalBonusPaid, } = computeJewelerData(json, id); 
    yield put(cvDataSuccess({
      months: computeMonthData(month),
      totalCommission: totalCommission,
      totalRetail: totalRetail,
      commissionVolume: commissionVolume,
      totalBonusPaid: totalBonusPaid,
    }));
  } catch (e) {
    yield put(cvDataFailed(e.message));
  }
}

export function* watchCvRequested() {
  yield takeLatest(CVDATA_REQUESTED, getCvData);
}
