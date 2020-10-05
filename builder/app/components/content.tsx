// @flow
import React, { Component } from 'react';

export default class Content extends Component<any, any> {
	render() {
		let style = {};
		if (this.props.flex) {

			style = { display: 'flex', flex: 1 }
		}
		return (
			<div
				className="content-wrapper"
				style={{
					minHeight: 'calc(100vh-50px)',
					position: 'relative',
					overflowY: 'scroll',
					...style
				}}
			>
				{this.props.children}
			</div>
		);
	}
}
