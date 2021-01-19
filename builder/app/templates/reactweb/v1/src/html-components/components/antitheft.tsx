import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import { uuidv4 } from './util';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';
import DropDown from './dropdown';
import GenericDropDown from './genericdropdown';

export default class AntiTheft extends GenericDropDown {
	constructor(props: any) {
		super(props);
		this.options = [{ title: 'Anti-theft', value: '1' }, { title: 'None', value: 'N' }];
	}
}
