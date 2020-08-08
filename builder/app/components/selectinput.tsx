// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
export default class SelectInput extends Component<any, any> {
	label() {
		return this.props.label || '{label}';
	}

	value() {
		return this.props.value || '';
	}

	options() {
		if (this.props.options) {
			let options = this.props.options;
			if (typeof options === 'function') {
				options = options();
			}
			return options.ddSort().map((t: any, index: any) => (
				<option key={`option-${index}`} value={t.value}>
					{t.title}
				</option>
			));
		}
		return [];
	}

	disabled(): string {
		return this.props.disabled ? 'disabled' : '';
	}

	render() {
		let extra: any = {};
		let selectExtra: any = {};

		selectExtra.disabled = this.disabled() || false;
		if (this.props.color) {
			extra.color = this.props.color;
			extra.style = { '--color': this.props.color };
		}
		return (
			<div className="form-group">
				<label {...extra}>{this.label()}</label>
				<select
          className="form-control"
          {...selectExtra}
					onSelect={(evt: any) => {
						if (this.props.onChange) {
							this.props.onChange(evt.target.value);
						}
					}}
					onChange={(evt) => {
						if (this.props.onChange) {
							this.props.onChange(evt.target.value);
						}
					}}
					value={this.value()}
				>
					<option value="">{this.props.defaultSelectText || Titles.Select}</option>
					{this.options()}
				</select>
			</div>
		);
	}
}
