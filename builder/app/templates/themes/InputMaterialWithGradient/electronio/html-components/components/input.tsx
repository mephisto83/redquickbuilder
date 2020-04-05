import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import * as style from './input.css';

export default class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = { $name: `input-${Date.now()}` };
	}
	label() {
		return InputFunctions.label(this);
	}
	immediate() {
		return InputFunctions.immediate(this);
	}
	value() {
		return InputFunctions.value(this);
	}
	placeholder() {
		return InputFunctions.placeholder(this);
	}
	disabled() {
		return InputFunctions.disabled(this);
	}
	componentDidMount() {
		InputFunctions.componentDidMount(this);
	}
	componentDidUpdate(prevProps) {
		InputFunctions.componentDidUpdate(this, prevProps);
	}

	cssClasses() {
		return '';
	}
	render() {
		var handleKeyPress = InputFunctions.handleKeyPress(this);
		return (
			<div className={`${style.form__group} ${style.field}`}>
				<input
					type={this.inputType || 'text'}
					disabled={this.disabled()}
					className={`${style.form__field} ${this.cssClasses()}`}
					onBlur={InputFunctions.onBlur(this)}
					onFocus={InputFunctions.onFocus(this)}
					value={InputFunctions.value(this)}
					onKeyPress={handleKeyPress}
					onChange={InputFunctions.onChange(this)}
					placeholder={InputFunctions.placeholder(this)}
					required
					name={this.state.$name}
				/>
				<label className={`${style.form__label}`} for={this.state.$name}>
					{InputFunctions.placeholder(this)}
				</label>
				<Validation data={this.props.error} />
			</div>
		);
	}
}

Input.propTypes = {
	inputType: function(v) {
		return null;
	},
	error: function(v) {
		return null;
	},
	data: function(v) {
		return null;
	}
};
