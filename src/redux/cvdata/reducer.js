import {
  CVDATA_REQUESTED,
  CVDATA_FAILED,
  CVDATA_SUCCESS,
} from './constants';

import round from 'lodash/round';

const initialState = {
  loading: true,
  errorMessage: '',
  months: [],
  totalRetail: 0,
  totalCommission: 0,
  totalCommissionVolume: 0,
  totalBonusPaid: 0,
}

export const cvdata = (state = initialState, action) => {
  switch (action.type) {
    case CVDATA_SUCCESS:
      return {
        ...state,
        loading: false,
        months: action.months,
        totalRetail: round(action.totalRetail, 2),
        totalCommission: {
          total: round(action.totalCommission.total, 2),
          percentages: {
            ...action.totalCommission.percentages,
          },
        },
        totalCommissionVolume: {
          total: round(action.commissionVolume.total, 2),
          percentages: {
            ...action.commissionVolume.percentages,
          },
        },
        totalBonusPaid: round(action.totalBonusPaid, 2),
        errorMessage: '',
      };
    case CVDATA_FAILED:
      return {
        ...state,
        loading: false,
        months: [],
        totalRetail: 0,
        totalCommission: 0,
        totalCommissionVolume: 0,
        totalBonusPaid: 0,
        errorMessage: action.errorMessage,
      };
    case CVDATA_REQUESTED:
      return {
        ...state,
        loading: true,
        months: [],
        totalRetail: 0,
        totalCommission: 0,
        totalCommissionVolume: 0,
        totalBonusPaid: 0,
        errorMessage: '',
      };
    default:
      return state;
  }
}