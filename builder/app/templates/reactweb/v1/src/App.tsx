import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/root';
import thunk from 'redux-thunk';
import { configureStore, history } from './store/configureStore';
import { createStore, applyMiddleware } from 'redux';
import createRootReducer from './reducers/index';
import './app.global.css';

let store = createStore(createRootReducer(history), applyMiddleware(thunk));

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);
