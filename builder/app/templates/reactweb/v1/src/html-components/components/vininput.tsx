import Input from './input';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import InputFunctions from './inputfunctions';
import React from 'react';

let _redservice: any;
function redservice() {
	_redservice = _redservice || createRedService(Globals.DEFAULT_URL)
	return _redservice;
}


export default class VINInput extends Input {
	changedText(a: { target: { checked: any; value: any } }) {
		let value = a.target.value;
		if (value && value.length === 17) {
			return redservice().get(`/api/red/autoservice/get/vin/${value}`).then((result: VehicleIdentificationNumberResult) => {
				this.setState({
					vins: result.results
				});
			});
		}
	}
	renderVINs() {
		if (this.state && this.state.vins) {
			return this.state.vins.map((vin: VehicleIdentificationNumber) => {
				return (<div key={`${vin.makeID}-${vin.modelID}-${vin.modelYear}`} onClick={() => {
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