// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import * as style from './selectinput.css';
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
			return options.map((t, index) => (
				<option key={`option-${index}`} value={t.value}>
					{t.title}
				</option>
			));
		}
		return [];
	}

	disabled() {
		return this.props.disabled ? 'disabled' : '';
	}

	render() {
		let extra = {};
		if (this.props.color) {
			extra.color = this.props.color;
			extra.style = { '--color': this.props.color };
		}
		return (
			<div className="form-group">
				<label {...extra}>{this.label()}</label>
				<select
					className="form-control"
					disabled={this.disabled()}
					onSelect={(evt) => {
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
