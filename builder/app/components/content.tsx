// @flow
import React, { Component } from 'react';

export default class Content extends Component<any, any> {
	render() {
		return (
			<div
				className="content-wrapper"
				style={{
					minHeight: 'calc(100vh-50px)',
					position: 'relative'
				}}
			>
				{this.props.children}
			</div>
		);
	}
}
