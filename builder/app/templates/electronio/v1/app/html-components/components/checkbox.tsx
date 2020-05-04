import React from 'react';
import Input from './input';
import * as styles from './checkbox.css';

export default class CheckBox extends Input {
	constructor(props: any) {
		super(props);
		this.inputType = 'checkbox';
	}
	cssClasses() {
		return styles.checkBox;
	}
}
