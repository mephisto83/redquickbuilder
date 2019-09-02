import * as React from 'react';
import { Provider } from 'react-redux';
import { createAppContainer } from 'react-navigation';
import { createStore } from 'redux';
import { buildReducers } from './reducers/index';
import { RootStack } from './navigationstack';

// A very simple store
let store = createStore(buildReducers());

// Create our stack navigator
// And the app container
let Navigation = createAppContainer(RootStack);

// Render the app container component with the provider around it
export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Navigation />
            </Provider>
        );
    }
}