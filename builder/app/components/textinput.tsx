import React, { Component } from 'react';

export default class TextInput extends Component<any, any> {
	inputType: any;
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

	light() {
		return this.props.light ? { color: 'white' } : {};
	}

	componentDidMount() {
		if (!this.immediate()) {
			this.setState({ value: this.props.value });
		}
	}

	componentDidUpdate(prevProps: any) {
		if (!this.immediate()) {
			if (!this.state.focused)
				if (this.state.value !== this.props.value) {
					this.setState({ value: this.props.value });
				}
		}
	}

	render() {
		const handleKeyPress = (event: { key: string }) => {
			if (!this.immediate()) {
				if (event.key === 'Enter') {
					if (this.props.onChange) {
						this.props.onChange(this.state.value || '');
					}
				}
			}
		};
		if (this.props.textarea) {
			return (
				<div className={this.props.inputgroup ? 'input-group' : 'form-group'}>
					{this.props.inputgroup ? null : <label>{this.label()}</label>}
					<textarea
						disabled={this.disabled() ? true : false}
						className="form-control"
						style={{ minHeight: 150 }}
						onBlur={() => {
							if (this.props.onBlur) {
								this.props.onBlur();
							}
							if (!this.immediate()) {
								if (this.props.onChange) {
									if (this.state.value !== this.props.value)
										this.props.onChange(this.state.value || '');
								}
							}
							if (this.props.onChanged) {
								this.props.onChanged(this.state.value || '');
							}
							this.setState({ focused: false });
						}}
						onFocus={() => {
							if (this.props.onFocus) {
								this.props.onFocus();
							}
							this.setState({ focused: true });
						}}
						value={this.value()}
						onKeyPress={handleKeyPress}
						onChange={(v) => {
							if (this.props.onChangeText) {
								this.props.onChangeText(v.target.value);
							}
							if (this.immediate()) {
								if (this.props.onChange) {
									this.props.onChange(v.target.value);
								}
							} else {
								this.setState({ value: v.target.value });
							}
						}}
						placeholder={this.placeholder()}
					/>
					{this.props.inputgroup ? (
						<span className="input-group-btn">
							<button
								onClick={() => {
									if (this.props.onClick) {
										this.props.onClick();
									}
								}}
								name="search"
								id="search-btn"
								className="btn btn-flat"
							>
								<i className="fa fa-edit" />
							</button>
						</span>
					) : null}
				</div>
			);
		}
		return (
			<div className={this.props.inputgroup ? 'input-group' : 'form-group'}>
				{this.props.inputgroup || this.props.slim ? null : <label style={this.light()}>{this.label()}</label>}
				<input
					type={this.inputType || 'text'}
					disabled={this.disabled() ? true : false}
					className="form-control"
					onBlur={() => {
						if (this.props.onBlur) {
							this.props.onBlur();
						}
						if (!this.immediate()) {
							if (this.props.onChange) {
								if (this.state.value !== this.props.value) this.props.onChange(this.state.value || '');
							}
						}
						if (this.props.onChanged) {
							this.props.onChanged(this.props.value || '');
						}
						this.setState({ focused: false });
					}}
					onFocus={() => {
						if (this.props.onFocus) {
							this.props.onFocus();
						}
						this.setState({ focused: true });
					}}
					value={this.value()}
					onKeyPress={handleKeyPress}
					onChange={(v) => {
						if (this.props.onChangeText) {
							this.props.onChangeText(v.target.value);
						}
						if (this.immediate()) {
							if (this.props.onChange) {
								this.props.onChange(v.target.value);
							}
						} else {
							this.setState({ value: v.target.value });
						}
					}}
					placeholder={this.placeholder()}
				/>
				{this.props.inputgroup ? (
					<span className="input-group-btn">
						<button
							onClick={(e) => {
								if (this.props.onClick) {
									this.props.onClick();
								}
								if (this.props.onChange) {
									this.props.onChange(this.state.value);
								}
								e.stopPropagation();
								e.preventDefault();
							}}
							className="btn btn-flat"
						>
							<i className="fa fa-edit" />
						</button>
					</span>
				) : null}
			</div>
		);
	}
}
