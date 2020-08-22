// @flow
import React, { Component } from 'react';

export default class TreeViewItem extends Component<any, any> {
	icon() {
		return this.props.icon || 'fa fa-circle-o';
	}
	render() {
		if (this.props.hide) {
			return <span />;
		}
		return (
			<li>
				<a
					onClick={() => {
						if (this.props.onClick) this.props.onClick();
					}}
				>
					<i className={this.icon()} />
					{this.props.title}
					{this.props.right ? <span className="pull-right-container">{this.props.right}</span> : null}
				</a>
				{this.props.children}
			</li>
		);
	}
}
