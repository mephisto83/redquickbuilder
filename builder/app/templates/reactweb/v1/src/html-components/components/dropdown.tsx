import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import { uuidv4 } from './util';

export default class Dropdown extends React.Component<any, any> {
	inputType: string;
	constructor(props: any) {
		super(props);
		this.state = { id: `component_${uuidv4()}` };
		this.inputType = 'dropdown';
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
				<select
					id={this.state.id}
					disabled={this.disabled()}
					className={`form-control ${this.cssClasses()}`}
					onBlur={InputFunctions.onBlur(this)}
					onFocus={InputFunctions.onFocus(this)}
					value={InputFunctions.value(this)}
					onKeyPress={handleKeyPress}
					onChange={() => {
						let { options } = this.props;
						let el: any = document.querySelector(`#${this.state.id}`);
						let { value } = options[el.selectedIndex];
						InputFunctions.onChange(this)({ target: { checked: false, value: value } });
					}}
					placeholder={InputFunctions.placeholder(this)}
				>
					{this.renderOptions()}
				</select>
				<Validation data={this.props.error} />
			</div>
		);
	}
	renderOptions(): React.ReactNode {
		let { options } = this.props;
		if (options) {
			return options.map((item: { value: string; title: string }) => {
				return (
					<option key={`${item.title}-$-${item.value}`} value={item.value}>
						{item.title}
					</option>
				);
			});
		}
		return [];
	}
}
