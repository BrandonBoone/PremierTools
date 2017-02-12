import {
  DATERANGE_DATE_CHANGED,
} from './constants';

export const dateRangeChanged = (year, month, id) => ({
  type: DATERANGE_DATE_CHANGED,
  year,
  month,
  id,
});
