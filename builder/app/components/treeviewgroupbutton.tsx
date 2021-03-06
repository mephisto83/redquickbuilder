// @flow
import React, { Component } from 'react';

export default class TreeViewGroupButton extends Component<any, any> {
	icon() {
		return this.props.icon || 'fa fa-circle-o';
	}
	render() {
		if (this.props.hide) {
			return <span />;
		}
		return (
			<button
				title={this.props.title}
				type="button"
				onClick={() => {
					if (this.props.onClick) {
						this.props.onClick();
					}
				}}
				className={
					this.props.on ? `btn btn-default ${this.props.btn || 'btn-primary'}` : 'btn btn-default btn-flat'
				}
				style={{
					backgroundColor: 'transparent',
					position: 'relative',
					borderColor: 'transparent'
				}}
			>
				<i className={this.icon()} style={{ color: '#8aa4af' }} />
				{this.props.plus ? (
					<i
						className={'fa fa-plus'}
						style={{
							position: 'absolute',
							fontSize: 8,
							color: '#8aa4af'
						}}
					/>
				) : null}{' '}
			</button>
		);
	}
}
