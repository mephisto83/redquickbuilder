import React from 'react';
import Validation from './validation';
import Input from './input';
import InputFunctions from './inputfunctions';
export default class DateInput extends Input {
	inputType: string;
	constructor(props: any) {
		super(props);
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
