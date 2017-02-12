import {
  CVDATA_REQUESTED,
  CVDATA_FAILED,
  CVDATA_SUCCESS,
} from './constants';

const initialState = {
  loading: true,
  errorMessage: '',
}

export const cvdata = (state = initialState, action) => {
  switch (action.type) {
    case CVDATA_SUCCESS:
      return {
        ...state,
        loading: false,
        months: action.months,
        errorMessage: '',
      };
    case CVDATA_FAILED:
      return {
        ...state,
        loading: false,
        months: [],
        errorMessage: action.errorMessage,
      };
    case CVDATA_REQUESTED:
      return {
        ...state,
        loading: true,
        months: [],
        errorMessage: '',
      };
    default:
      return state;
  }
}