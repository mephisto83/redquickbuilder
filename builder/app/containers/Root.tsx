// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import Routes from '../Routes';

import { setHistory } from '../actions/uiActions';

export default class Root extends Component<any, any> {
	componentDidMount() {
		setHistory(this.props.history);
	}
	render() {
		const { store, history } = this.props;
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<Routes />
				</ConnectedRouter>
			</Provider>
		);
	}
}
