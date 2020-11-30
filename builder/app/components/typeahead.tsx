import React, { Component } from 'react';
import TextInput from './textinput';
import { GetNodeById, GetNodeTitle } from '../actions/uiActions';

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
	nodeSelect(t: string) {
		if (this.props.nodeSelect) {
			return this.props.nodeSelect(t);
		}
		return t;
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
		let options = this.props.options
			? this.props.options
					.filter((v: any) => this.value() && (this.state.focus || this.state.hovering))
					.filter((v: any) => {
						const res =
							`${v.title}  ${v.value}`.toLowerCase().indexOf(`${this.value()}`.toLowerCase()) !== -1;
						return res;
					})
			: [];
		let emp: any = {
			['--container-height']: `${Math.max(5, Math.min(10, options.length ? options.length : 0)) * 30}px`
		};
		return (
			<div
				className={`typeahead  ${options.length && this.state.focus ? 'open' : ''}`}
				style={emp}
				onMouseOut={() => {
					this.setState({ hovering: false });
				}}
				onMouseOver={() => {
					if (this.state.focus) this.setState({ hovering: true });
				}}
			>
				<TextInput
					value={this.nodeSelect(this.state.value)}
					label={this.label()}
					placeholder={this.placeholder()}
					disabled={this.disabled()}
					immediate={true}
					onFocus={() => {
						this.setState({ focus: true });
					}}
					onBlur={() => {
						setTimeout(() => {
							this.setState({ focus: false });
							if (this.immediate()) {
								if (this.props.onChange) {
									if (this.state.value !== this.props.value)
										this.props.onChange(this.state.value || '');
								}
							}
						}, 100);
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
				{options && options.length ? (
					<div className={`typeaheadContainer`}>
						{options.map((option: { title: string; value: any }, index: number) => {
							let ops = (
								<div
									title={option.title}
									key={`allowed-${index}`}
									className="external-event"
									style={{
										cursor: 'pointer',
										overflow: 'hidden',
										whiteSpace: 'nowrap',
										textOverflow: 'ellipsis',
										color: 'black'
									}}
									onMouseDown={() => {
										if (this.props.onChange) {
											this.props.onChange(option.value);
											this.setState({ value: option.value, focus: false, hovering: false });
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
