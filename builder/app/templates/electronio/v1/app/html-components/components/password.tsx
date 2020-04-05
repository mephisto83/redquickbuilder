import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import Input from './input';
export default class Password extends Input {
	constructor(props) {
		super(props);
    this.inputType = 'password';
	}
}
