// @flow
import React, { Component } from 'react';

export default class DashboardLogo extends Component<any, any> {
	render() {
		return (
			<a
				className="logo"
				style={{
					zIndex: 11000,
					position: 'absolute'
				}}
			>
				<span className="logo-mini">
					<b>R</b>QB
				</span>
				<span className="logo-lg">
					<b>Red</b>
					{this.props.word || 'QuickBuilder'}
				</span>
			</a>
		);
	}
}
