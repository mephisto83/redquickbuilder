import React from 'react';
import { render } from 'react-dom';
import Root from './containers/root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

const store = configureStore();

render(
  <React.StrictMode>
    <Root store={store} history={history} />
  </React.StrictMode>,
  document.getElementById('root')
);