import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import './input.css';

export default class Input extends React.Component<any, any> {
	inputType: string;
	constructor(props: any) {
		super(props);
		this.state = { $name: `input-${Date.now()}` };
		this.inputType = '';
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
	componentDidUpdate(prevProps: any) {
		InputFunctions.componentDidUpdate(this, prevProps);
	}

	cssClasses() {
		return '';
	}
	render() {
		var handleKeyPress = InputFunctions.handleKeyPress(this);
		return (
			<div className={`form__group  field}`}>
				<input
					type={this.inputType || 'text'}
					disabled={this.disabled() ? true : false}
					className={` form__field ${this.cssClasses()}`}
					onBlur={InputFunctions.onBlur(this)}
					onFocus={InputFunctions.onFocus(this)}
					value={InputFunctions.value(this)}
					onKeyPress={handleKeyPress}
					onChange={InputFunctions.onChange(this)}
					placeholder={InputFunctions.placeholder(this)}
					required
					name={this.state.$name}
				/>
				<label className={` form__label`} htmlFor={this.state.$name}>
					{InputFunctions.placeholder(this)}
				</label>
				<Validation data={this.props.error} />
			</div>
		);
	}
}
