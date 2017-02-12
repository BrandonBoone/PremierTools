import {
  CVDATA_REQUESTED,
  CVDATA_FAILED,
  CVDATA_SUCCESS,
} from './constants';

export const cvDataRequested = () => ({
  type: CVDATA_REQUESTED,
});

export const cvDataFailed = (errorMessage) => ({
  type: CVDATA_FAILED,
  errorMessage,
});

export const cvDataSuccess = (months) => ({
  type: CVDATA_SUCCESS,
  months,
});
