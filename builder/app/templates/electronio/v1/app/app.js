// import * as React from 'react';
// import { Provider } from 'react-redux';
// import { createAppContainer } from 'react-navigation';
// import { createStore, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import { buildReducers } from './reducers/index';
// import { RootStack } from './navigationstack';

// // A very simple store
// let store = createStore(buildReducers(), applyMiddleware(thunk));

// // Create our stack navigator
// // And the app container
// let Navigation = createAppContainer(RootStack);

// // Render the app container component with the provider around it
// export default class App extends React.Component {
//     render() {
//         return (
//             <Provider store={store}>
//                 <Navigation />
//             </Provider>
//         );
//     }
// }


import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import { createStore, applyMiddleware } from 'redux';
import { buildReducers } from './reducers/index';
import './app.global.css';

let store = createStore(buildReducers(), applyMiddleware(thunk));

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);
