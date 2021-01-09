// @flow
import React, { Component } from 'react';
import TextInput from './textinput';

export default class Panel extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let style: any = {};
		let boxBodyStyle: any = {};
		if (this.props.stretch) {
			style.display = 'flex';
			style.flexDirection = 'column';
			style.position = 'relative';
			boxBodyStyle.height = '100%';
			boxBodyStyle.overflow = 'auto';
			boxBodyStyle.maxHeight = 'calc(100vh - 115px)';
			style.maxHeight = '100%';
			style.height = '100%';
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
				{this.props.onSearch && !this.state.open ? (
					<div className="box-header">
						<TextInput
							slim
							placeholder={'search'}
							immediate
							value={this.state.search}
							onChange={(val: string) => {
								this.setState({ search: val });
								this.props.onSearch(val);
							}}
						/>
					</div>
				) : null}
				<div style={boxBodyStyle} className="box-body">
					{this.props.children}
				</div>
			</div>
		);
	}
}
