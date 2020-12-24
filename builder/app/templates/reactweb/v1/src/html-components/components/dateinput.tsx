import React from 'react';
import Validation from './validation';
import Input from './input';
import InputFunctions from './inputfunctions';
export default class DateInput extends Input {
	inputType: string;
	constructor(props: any) {
		super(props);
		this.inputType = 'date';
	}
 
}
