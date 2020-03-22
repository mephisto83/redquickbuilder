import React from 'react';
import Input from './input';

export default class CheckBox extends Input {
	constructor(props) {
    super(props);
    this.inputType = 'check';
	}
}
