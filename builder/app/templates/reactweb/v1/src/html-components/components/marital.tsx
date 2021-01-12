import GenericDropDown from './genericdropdown';

export default class MaritalStatus extends GenericDropDown {
	constructor(props) {
		super(props);

		this.options = [
			{ title: 'Single', value: 'S' }, 
			{ title: 'Married', value: 'M' }, 
			{ title: 'Separated', value: 'P' }, 
			{ title: 'Widowed', value: 'W' }, 
			{ title: 'Divorced', value: 'D' }]
	}

}
