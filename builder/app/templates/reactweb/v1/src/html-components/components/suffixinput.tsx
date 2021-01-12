import GenericDropDown from './genericdropdown';

export default class SuffixInput extends GenericDropDown {
	constructor(props) {
		super(props);
		this.options = [
			{ title: 'Jr', value: 'JR' },
			{ title: 'Sr', value: 'SR' },
			{ title: 'I', value: 'I' },
			{ title: 'II', value: 'II' },
			{ title: 'III', value: 'III' },
			{ title: 'IV', value: 'IV' }
		];
	}
}
