import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import './index.css';
import { Provider } from 'react-redux';
import configureStore from './store/configure-store';
import { cvDataRequested } from './redux/cvdata/actions';

const store = configureStore();

document.getElementById('outer_wrapper').innerHTML += '<div id="premierToolsCharts"></div>';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('premierToolsCharts')
);

store.dispatch(cvDataRequested());
