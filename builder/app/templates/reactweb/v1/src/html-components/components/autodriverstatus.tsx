import GenericDropDown from './genericdropdown';

export default class AutoDriverStatus extends GenericDropDown {
	constructor(props) {
		super(props);
		this.options = [
			{ title: 'Rated', value: 'R' },
			{ title: 'Disabled', value: 'D' },
			{ title: 'Incarcerated', value: 'I' },
			{ title: 'Other Insurance', value: 'O' },
			{ title: 'Never Licensed', value: 'L' },
			{ title: 'Permanently Revoked/Suspended/Surrendered Lic', value: 'P' },
			{ title: 'Military Deployed Overseas', value: 'H' },
		];
	}
}
