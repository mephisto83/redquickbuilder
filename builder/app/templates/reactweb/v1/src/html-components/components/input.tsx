import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';
export default class Input extends React.Component<any, any> {
	inputType: string;
	placeHolder?: string;
	dataCharset?: string
	pattern?: string;
	masked?: boolean;
	id: string;
	example: string;
	constructor(props: any) {
		super(props);
		this.state = {};
		this.inputType = '';
		this.example = '';
		this.id = `input-${Math.random()}`;
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

	isEditMode() {
		let { viewModel } = this.props;

		let editMode = false;
		if ($CreateModels && $UpdateModels) {
			if (($CreateModels as any)[viewModel] || ($UpdateModels as any)[viewModel]) {
				editMode = true;
			}
		}
		return editMode;
	}
	renderBeforeValidation(): any {
		return null;
	}
	renderAfterValidation(): any {
		return null;
	}
	renderBeforeInput(): any {
		return null;
	}
	renderAfterInput(): any {
		return null;
	}
	render() {
		var handleKeyPress = InputFunctions.handleKeyPress(this);
		if (!this.isEditMode()) {
			let extra_objects: any = {};
			if (this.inputType === 'checkbox') {
				extra_objects.checked = InputFunctions.value(this);
			}
			else if (this.inputType === 'date') {
				let temp = InputFunctions.value(this);
				let date = Date.parse(temp)
				if (!isNaN(date)) {
					temp = new Date(date).toDateString()
				}
				return (<div className="form__group field">
					{this.renderBeforeInput()}
					<span>{temp}</span>
					{this.renderAfterInput()}
				</div>);
			}
			return (<div className="form__group field">
				{this.renderBeforeInput()}
				<input
					type={this.inputType || 'text'}
					disabled
					className={`form-control ${this.cssClasses()}`}
					{...extra_objects}
					value={InputFunctions.value(this)}
				/>
				{this.renderAfterInput()}
			</div>)
		}

		return (
			<div className="form__group field">
				{this.renderBeforeInput()}
				<input
					type={this.inputType || 'text'}
					disabled={this.disabled()}
					pattern={this.props.pattern || this.pattern}
					className={`form-control ${this.cssClasses()}`}
					onBlur={InputFunctions.onBlur(this)}
					onFocus={InputFunctions.onFocus(this)}
					value={InputFunctions.value(this)}
					onKeyPress={handleKeyPress}
					onChange={InputFunctions.onChange(this)}
					placeholder={InputFunctions.placeholder(this)}
					data-placeholder={InputFunctions.placeholder(this)}
					data-pattern={this.props.pattern || this.pattern}
					data-valid-example={this.example || ''}
					data-charset={this.dataCharset}
				/>
				{this.renderAfterInput()}
				{this.renderBeforeValidation()}
				<Validation data={this.props.error} />
				{this.renderAfterValidation()}
			</div>
		);
	}
}
