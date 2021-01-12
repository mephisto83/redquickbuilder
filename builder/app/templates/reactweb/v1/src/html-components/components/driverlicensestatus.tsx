import GenericDropDown from './genericdropdown';

export default class DriverLicenseStatus extends GenericDropDown {
	constructor(props) {
		super(props);
		this.options = [
			{ title: 'Valid', value: 'V' },
			{ title: 'Suspended', value: 'S' },
			{ title: 'Permanently Revoked', value: 'R' },
			{ title: 'Expired', value: 'E' },
			{ title: 'Permit', value: 'P' },
			{ title: 'Not Licensed/State ID', value: 'N' }
		];
	}
}
