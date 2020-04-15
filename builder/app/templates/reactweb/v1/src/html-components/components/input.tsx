import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
export default class Input extends React.Component<{ [index: string]: any }> {
	inputType: string;
	constructor(props: any) {
		super(props);
		this.state = {};
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
	disabled(): any {
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
			<div className="form__group field">
				<input
					type={this.inputType || 'text'}
					disabled={this.disabled()}
					className={`form-control ${this.cssClasses()}`}
					onBlur={InputFunctions.onBlur(this)}
					onFocus={InputFunctions.onFocus(this)}
					value={InputFunctions.value(this)}
					onKeyPress={handleKeyPress}
					onChange={InputFunctions.onChange(this)}
					placeholder={InputFunctions.placeholder(this)}
				/>
				<Validation data={this.props.error} />
			</div>
		);
	}
}
