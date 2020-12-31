import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import { uuidv4 } from './util';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';

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
	renderViewMode() {
		if (!this.isEditMode()) {
			return (<div className="form__group field">
				{InputFunctions.placeholder(this)}
				{InputFunctions.value(this)}
			</div>)
		}
		else {
			return false;
		}
	}
	render() {
		var handleKeyPress = InputFunctions.handleKeyPress(this);

		if (!this.isEditMode()) {
			return this.renderViewMode();
		}

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
						if (el.selectedIndex) {
							let { value } = options[el.selectedIndex - 1];
							InputFunctions.onChange(this)({ target: { checked: false, value: value } });
						}
					}}
					placeholder={InputFunctions.placeholder(this)}
				>
					<option>Select Option</option>
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
