import * as React from 'react';
import View from './view';
import { InputEvent } from './types';
import IncidentCodeInput from './incidentcodeinput';
import DateInput from './dateinput';
import Button from './button';

export default class AccidentViolationInput extends React.Component<any, any> {
	render() {
		let accidentViolation: AccidentViolation = this.props.value;

		return (
			<View>
				<IncidentCodeInput
					value={accidentViolation.code}
					onChange={(evt: InputEvent) => {
						if (evt && evt.target) {
							accidentViolation.code = evt.target.value;
							this.setState({ turn: Date.now() })
						}
					}} />
				<DateInput value={accidentViolation.date}
					onChange={(evt: InputEvent) => {
						if (evt && evt.target) {
							accidentViolation.date = evt.target.value;
							this.setState({ turn: Date.now() })
						}
					}} />
				<Button onClick={() => {
					if (this.props.onDelete) {
						this.props.onDelete();
					}
				}} >-</Button>
			</View>
		);
	}
}

export interface AccidentViolation {
	code: string;
	date: string;
}