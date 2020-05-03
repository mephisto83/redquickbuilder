// @flow
import React, { Component } from 'react';

export default class TabPane extends Component<any, any> {
	active() {
		return this.props.active ? 'active' : '';
	}
	render() {
		let style = this.props.style || {};
		return (
			<div className={`tab-pane ${this.active()}`} style={{ ...style }}>
				{this.props.active ? this.props.children : null}
			</div>
		);
	}
}
