import Input from './input';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import InputFunctions from './inputfunctions';
import React from 'react';
import Validation from './validation';
import * as CarMakeInput from './carmakeinput';
import * as CarModelInput from './carmodelinput';
import * as CarYearInput from './caryearinput';

let _redservice: any;
function redservice() {
	_redservice = _redservice || createRedService(Globals.DEFAULT_URL)
	return _redservice;
}


export default class VINInput extends Input {
	changedText(a: { target: { checked: any; value: any } }) {
		let value = a.target.value;
		return redservice().get(`/api/red/autoservice/get/vin/${value}`).then((result: VehicleIdentificationNumberResult) => {
			this.setState({
				vins: result.results
			});
		});
	}
	renderVINs() {
		if (this.state && this.state.vins) {
			return this.state.vins.map((vin: VehicleIdentificationNumber) => {
				return (<div key={`${vin.makeID}-${vin.modelID}-${vin.modelYear}`} onClick={() => {
					CarMakeInput.RaiseEvent({ value: vin.makeID, valueTitle: vin.make }, CarMakeInput.VIN_SET, this.props.context);
					CarModelInput.RaiseEvent({ value: vin.modelID, valueTitle: vin.model }, CarMakeInput.VIN_SET, this.props.context);
					CarYearInput.RaiseEvent({ value: vin.modelYear, valueTitle: vin.modelYear }, CarMakeInput.VIN_SET, this.props.context);
				}}>
					<span>{vin.modelYear}</span>
					<span>{vin.make}</span>
					<span>{vin.model}</span>
				</div>)
			})
		}
		return [];
	}
    componentDidUpdate(prevProps: any) {
        InputFunctions.componentDidUpdateV2(this, prevProps);
    }
	renderBeforValidation() {
		return this.renderVINs();
	}
	// render() {
	// 	var handleKeyPress = InputFunctions.handleKeyPress(this);
	// 	if (!this.isEditMode()) {
	// 		return (<div className="form__group field">
	// 			<input
	// 				type={this.inputType || 'text'}
	// 				disabled
	// 				className={`form-control ${this.cssClasses()}`}
	// 				value={InputFunctions.value(this)}
	// 			/>
	// 		</div>)
	// 	}

	// 	return (
	// 		<div className="form__group field">
	// 			<input
	// 				type={this.inputType || 'text'}
	// 				disabled={this.disabled()}
	// 				className={`form-control ${this.cssClasses()}`}
	// 				onBlur={InputFunctions.onBlur(this)}
	// 				onFocus={InputFunctions.onFocus(this)}
	// 				value={InputFunctions.value(this)}
	// 				onKeyPress={handleKeyPress}
	// 				onChange={InputFunctions.onChange(this)}
	// 				placeholder={InputFunctions.placeholder(this)}
	// 			/>
	// 			{this.renderVINs()}
	// 			<Validation data={this.props.error} />
	// 		</div>
	// 	);
	// }
}
export interface VehicleIdentificationNumber {
	vIN: string;
	modelID: string;
	model: string;
	modelYear: string;
	makeID: string;
	make: string;
	manufactorerId: string;
}

export interface VehicleIdentificationNumberResult {
	count: number;
	message: string;
	searchCriteria: any;
	results: VehicleIdentificationNumber[]
}