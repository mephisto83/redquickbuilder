// @flow
import React, { Component } from 'react';

export default class Header extends Component<any, any> {
	render() {
		return (
			<header className="main-header" style={{ '-webkit-app-region': 'drag' }}>
				{this.props.children}
			</header>
		);
	}
}
