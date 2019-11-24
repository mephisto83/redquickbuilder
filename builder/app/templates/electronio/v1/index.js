/**
 * @format
 */

import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import {  history } from './store/configureStore';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { buildReducers } from './reducers/index';
import './app.global.css';

// const store = configureStore();
let store = createStore(buildReducers(), applyMiddleware(thunk));

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);
