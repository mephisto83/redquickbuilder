import React, { Component } from 'react';
import TextInput from './textinput';

export default class Typeahead extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	label() {
		return this.props.label || '{label}';
	}

	immediate() {
		return this.props.immediate || false;
	}

	value() {
		if (this.immediate()) {
			return this.props.value || '';
		}
		return this.state.value || '';
	}

	placeholder() {
		return this.props.placeholder || '';
	}

	disabled() {
		return this.props.disabled ? 'disabled' : '';
	}

	componentDidMount() {
		if (!this.immediate()) {
			this.setState({ value: this.props.value });
		}
	}

	componentDidUpdate(prevProps) {
		if (!this.immediate()) {
			if (!this.state.focus)
				if (this.state.value !== this.props.value) {
					this.setState({ value: this.props.value });
				}
		}
	}

	render() {
		return (
			<div className={'typeahead'}>
				<TextInput
					value={this.state.value}
					label={this.label()}
					placeholder={this.placeholder()}
					disabled={this.disabled()}
					immediate={true}
					onFocus={() => {
						this.setState({ focus: true });
					}}
					onBlur={() => {
						this.setState({ focus: false });
						if (!this.immediate()) {
							if (this.props.onChange) {
								if (this.state.value !== this.props.value) this.props.onChange(this.state.value || '');
							}
						}
					}}
					onChange={(value) => {
						if (this.immediate()) {
							if (this.props.onChange) {
								this.props.onChange(value);
							}
						} else {
							this.setState({ value });
						}
					}}
					onChangeText={(value) => {
						if (this.immediate()) {
							if (this.props.onChange) {
								this.props.onChange(value);
							}
						}
						this.setState({ value });
					}}
				/>
				{this.props.options && this.props.options.length ? (
					<div
						className={'typeaheadContainer'}
						onMouseOut={() => {
							this.setState({ hovering: false });
						}}
						onMouseOver={() => {
							this.setState({ hovering: true });
						}}
					>
						{this.props.options
							.filter((v) => this.value() && (this.state.focus || this.state.hovering))
							.filter((v) => {
								const res = `${v.title}`.toLowerCase().indexOf(`${this.value()}`.toLowerCase()) !== -1;
								return res;
							})
							.map((option, index) => {
								let ops = (
									<div
										title={option.title}
										key={`allowed-${index}`}
										className="external-event"
										style={{
											cursor: 'pointer',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
											textOverflow: 'ellipsis'
										}}
										onClick={() => {
											if (this.props.onChange) {
												this.props.onChange(option.value);
												this.setState({ value: option.value });
											}
										}}
									>
										{this.props.renderItem ? this.props.renderItem(option) : option.title}
									</div>
								);

								return ops;
							})}
					</div>
				) : null}
			</div>
		);
	}
}
