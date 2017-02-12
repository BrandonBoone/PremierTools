import { cvdata } from './cvdata/reducer';
import { dateRange } from './dateRange/reducer';
import { jeweler } from './jeweler/reducer';
import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive'

const rootReducer = combineReducers({
  cvdata,
  dateRange,
  jeweler,
  browser: createResponsiveStateReducer(null, {
    extraFields: () => ({
      width: window.innerWidth,
    }),
  })
});

export default rootReducer;