import rootReducer from '../redux/index.js';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchCvRequested } from '../redux/cvdata/sagas';
import { responsiveStoreEnhancer } from 'redux-responsive';
import { calculateResponsiveState } from 'redux-responsive';
import { setJewelerId } from '../redux/jeweler/actions';
import debounce from 'lodash/debounce';

export default (initialState) => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ||
    unsafeWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ||// eslint-disable-line
    compose;

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      responsiveStoreEnhancer,
      applyMiddleware(sagaMiddleware)
    )
  );

  window.addEventListener('resize', debounce(() => store.dispatch(calculateResponsiveState(window)), 250));

  sagaMiddleware.run(watchCvRequested);

  store.dispatch(
    setJewelerId(document.getElementById('toptext').innerText.split('|')[0].trim())
  );

  return store;
};


