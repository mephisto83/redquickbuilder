import GenericDropDown from './genericdropdown';

export default class IncidentCodeInput extends GenericDropDown {
	constructor(props: any) {
		super(props);

		this.options = [
			{ title: 'AAF-At Fault Accident', value: 'AAF' }, 
			{ title: 'BOT-Open Bottle', value: 'BOT' }, 
			{ title: 'CML-Commercial Vehicle Violation', value: 'CML' }, 
			{ title: 'CMP-Comp Claim greater than $1,000 (excluding weather related losses)', value: 'CMU' }, 
			{ title: 'CMU-Any weather related loss or Comp Claim $1000 or less', value: 'CMU' },
			{ title: 'CRD-Careless/Improper Operation', value: 'CRD' },
			{ title: 'DEQ-Defective Equipment', value: 'DEQ' },
			{ title: 'DEV-Traffic Device/Sign', value: 'DEV' },
			{ title: 'DR-Drag Racing', value: 'DR' },
			{ title: 'DWI-Drive Under Influence', value: 'DWI' },
			{ title: 'FDL-Foreign Drivers License', value: 'FDL' },
			{ title: 'FEL-Auto Theft/Felony Motor Vehicle', value: 'FEL' },
			{ title: 'FLE-Fleeing From Police', value: 'FLE' },
			{ title: 'FRA-Failure to Report Accident', value: 'FRA' },
			{ title: 'FTC-Following Too Close', value: 'FTC' },
			{ title: 'FTY-Failure to Yield', value: 'FTY' },
			{ title: 'HOM-Vehicular Homicide', value: 'HOM' },
			{ title: 'IP-Improper Passing', value: 'IP' },
			{ title: 'IT-Improper Turn', value: 'IT' },
			{ title: 'LIC-License/Credentials', value: 'LIC' },
			{ title: 'LTS-Leaving the Scene', value: 'LTS' },
			{ title: 'MMV-Minor Moving Violation', value: 'MMV' },
			{ title: 'NAF-Not at Fault Accident', value: 'NAF' },
			{ title: 'SLV-Serious License Violation', value: 'SLV' },
			{ title: 'SPD-Speeding', value: 'SPD' },
			{ title: 'SUS-Driving under Suspension', value: 'SUS' },
			{ title: 'WOC-Operating without Owners Consent', value: 'WOC' },
			{ title: 'WSR-Wrong way on a one-way street', value: 'WSR' }
		];
	}

}
