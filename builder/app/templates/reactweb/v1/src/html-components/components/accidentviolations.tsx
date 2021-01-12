import * as React from 'react';
import View from './view';
import Button from './button';
import AccidentViolationInput from './accidentviolation';

export default class AccidentViolationsInput extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			value: {
				incidents: []
			}
		};
	}

	componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
		if (this.props.value !== prevProps.value) {
			this.setState({
				value: this.props.value || { incidents: [] }
			});
		}
	}
	render() {
		var props = {
			...this.props
		};
		delete props.children;

		let accidentViolations: AccidentViolations = this.state.value;
		if (!accidentViolations) {
			accidentViolations = { incidents: [] };
		}
		let incidents: AccidentViolation[] = accidentViolations.incidents;
		return (
			<View>
				<View>
					<Button onClick={() => {
						let incidents: any[] = this.state.value.incidents;
						incidents.push({});
						this.setState({
							...this.state.value
						}, () => {
							if (this.props.onChangeText) {
								this.props.onChangeText(this.state.value);
							}
						});
					}}>+</Button>
				</View>
				{incidents.map((incident: AccidentViolation, index: number) => {
					return <AccidentViolationInput onDelete={() => {
						accidentViolations.incidents.splice(index, 1);
						this.setState({
							value: accidentViolations
						}, () => {
							if (this.props.onChangeText) {
								this.props.onChangeText(this.state.value);
							}
						});
					}} value={incident} />
				})}
			</View>
		);
	}
}

export interface AccidentViolations {
	incidents: AccidentViolation[]
}
export interface AccidentViolation {
	value: string;
	date: string;
}