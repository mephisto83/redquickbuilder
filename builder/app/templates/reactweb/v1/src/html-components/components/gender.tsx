import GenericDropDown from './genericdropdown';

export default class Gender extends GenericDropDown {
	constructor(props) {
		super(props);
		this.options = [{ title: 'Male', value: 'Male' }, { title: 'Female', value: 'Female' }, { title: 'Nonbinary', value: 'Nonbinary' }];
	}
}
