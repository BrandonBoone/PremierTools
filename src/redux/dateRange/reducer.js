import {
  DATERANGE_DATE_CHANGED,
} from './constants';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import endOfMonth from 'date-fns/end_of_month';

const initialState = {
  from: {
    month: 1,
    year: 2016,
  },
  to: {
    month: 12,
    year: 2016,
  },
};

export const dateRange = (state = initialState, action) => {
  switch (action.type) {
    case DATERANGE_DATE_CHANGED:
      return {
        ...state,
        // pin the years together... for now.
        ...(action.id === 0 ? {
          from: {
            month: action.month,
            year: action.year,
          },
          to: {
            month: state.to.month,
            year: action.year,
          },
        } : {
          from: {
            month: state.from.month,
            year: action.year,
          },
          to: {
            month: action.month,
            year: action.year,
          },
        })
      };
    default:
      return state;
  }
};

export const getDates = state => {
  const dates = [];
  for (let i = state.dateRange.from.month; i <= state.dateRange.to.month; i += 1) {
    const start = parse(`${state.dateRange.from.year}-${i}-1`);
    const end = endOfMonth(start);

    dates.push({
      startDate: format(start, 'MM/DD/YYYY'),
      endDate: format(end, 'MM/DD/YYYY'),
      endDate2: format(end, 'YYMM'),
    })
  }
  console.log(dates);
  return dates;
};
