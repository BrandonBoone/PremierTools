import {
  JEWELER_SET_ID,
} from './constants';

const initialState = {
  id: null,
};

export const jeweler = (state = initialState, action) => {
  switch (action.type) {
    case JEWELER_SET_ID:
      return {
        ...state,
        id: action.id,
      };
    default:
      return state;
  }
};

export const getJewelerId = state => ({
  id: state.jeweler.id,
});
