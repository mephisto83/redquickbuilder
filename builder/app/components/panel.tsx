// @flow
import React, { Component } from 'react';

export default class Panel extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let style: any = {};
		let boxBodyStyle: any = {};
		if (this.props.stretch) {
			style.height = '100%';
			style.display = 'flex';
			style.flexDirection = 'column';
			style.position = 'relative';
			boxBodyStyle.height = '100%';
			boxBodyStyle.overflow = 'auto';
		}
		return (
			<div className="box box-default" style={style}>
				<div
					className="box-header with-border"
					style={{
						'-webkit-app-region': 'no-drag'
					}}
				>
					<i className="fa fa-warning" />
					<h3 className="box-title">{this.props.title}</h3>
				</div>
				<div style={boxBodyStyle} className="box-body">
					{this.props.children}
				</div>
			</div>
		);
	}
}
