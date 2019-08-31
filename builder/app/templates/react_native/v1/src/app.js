import { Scene, Router } from 'react-native-router-flux';

import * as Titles from './titles';
import Home from './home';
import SideDrawer from './sidedrawer';
// app.js

import * as utils from './util';

import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
const RouterWithRedux = connect()(Router);
import reducers from './reducers';
import * as Keys from './screens/keys';
// other imports...
import {
    TabBar,
    Modal,
    Schema,
    Actions,
    Reducer,
    ActionConst
} from 'react-native-router-flux';

import {
    Dimensions,
    AppState
} from 'react-native';

// create store...
const middleware = [thunk/* ...your middleware (i.e. thunk) */];
const store = compose(
    applyMiddleware(...middleware)
)(createStore)(reducers);


class App extends React.Component {
    componentDidMount() {

    }
    render() {
        return (
            <Provider store={store}>
                <RouterWithRedux>
                    <Scene key="root" hideNavBar={true}>
                        <Scene key={Keys.SideMenu} type={ActionConst.RESET} component={SideDrawer} open={false}>
                            <Scene key={Keys.Home} component={Home} hideNavBar={true} title="Home" />
                        </Scene>
                    </Scene>
                </RouterWithRedux>
            </Provider>
        );
    }
}
export default App; 
