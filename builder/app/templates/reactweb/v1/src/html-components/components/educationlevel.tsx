import GenericDropDown from './genericdropdown';

export default class EducationLevel extends GenericDropDown {
	constructor(props: any) {
		super(props);
		this.options = [
			{ title: 'No high school diploma or GED', value: '1' },
			{ title: 'High school diploma or GED', value: '2' },
			{ title: 'Vocational / trade school degree or military training', value: '3' },
			{ title: 'Completed some college', value: '4' },
			{ title: 'Currently in college ', value: '5' },
			{ title: 'College degree', value: '6' },
			{ title: 'Graduate work or graduate degree', value: '7' }
		];
	}
}
