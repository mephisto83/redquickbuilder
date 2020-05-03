// @flow
import React, { Component } from 'react';
import TextInput from './textinput';

export default class Box extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	label() {
		return this.props.label || '{label}';
	}

	value() {
		return this.props.value || '';
	}

	title() {
		return this.props.title || '{title}';
	}

	primary() {
		return this.props.primary ? 'box-primary' : '';
	}

	backgroundColor() {
		return this.props.backgroundColor ? this.props.backgroundColor : '';
	}

	render() {
		const style: any = {};
		const styleAll: any = {};
		const maxStyle = {};
		if (this.props.maxheight) {
			style.maxHeight = `${this.props.maxheight}px`;
			style.overflowY = 'auto';
		}

		if (this.backgroundColor()) {
			style.background = this.backgroundColor();
			styleAll.background = this.backgroundColor();
		}

		return (
			<div className={`box ${this.primary()}`} style={{ ...styleAll, ...maxStyle }}>
				<div
					className="box-header with-border"
					style={{ ...styleAll }}
					onClick={() => {
						this.setState({ open: !this.state.open });
					}}
				>
					<h3 className="box-title" style={{ cursor: 'pointer', ...styleAll }}>
						{this.title()}
					</h3>
				</div>
				{this.props.onSearch && !this.state.open ? (
					<div className="box-header">
						<TextInput
							slim
							placeholder={'search'}
							immediate
							value={this.state.search}
							onChange={(val) => {
								this.setState({ search: val });
								this.props.onSearch(val);
							}}
						/>
					</div>
				) : null}
				<div className="box-body" style={{ ...styleAll, ...style }}>
					{this.state.open ? null : this.props.children}
				</div>
				<div className="box-footer" style={{ ...styleAll }}>
					{this.props.footer}
				</div>
			</div>
		);
	}
}
