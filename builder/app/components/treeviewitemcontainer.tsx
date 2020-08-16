// @flow
import React, { Component } from 'react';

export default class TreeViewItemContainer extends Component<any, any> {
	icon() {
		return this.props.icon || 'fa fa-circle-o';
	}
	hide() {
		return this.props.hide;
	}
	render() {
		if (this.hide()) {
			return <li />;
		}
		return (
			<li>
				{this.props.title}
				{this.props.children}
			</li>
		);
	}
}
