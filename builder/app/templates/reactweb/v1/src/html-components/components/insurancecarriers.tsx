import GenericDropDown from './genericdropdown';

export default class InsuranceCarriers extends GenericDropDown {
	constructor(props: any) {
		super(props);
		this.options = [
			{ "title": "AAA/AUTO CLUB", "value": "5003" },
			{ "title": "ACUITY", "value": "5004" },
			{ "title": "AIG: GRANITE STATE INS CO", "value": "5012" },
			{ "title": "AIG: OTHER", "value": "5015" },
			{ "title": "ALLIED", "value": "5019" },
			{ "title": "ALLSTATE", "value": "5020" },
			{ "title": "AMERICAN FAMILY", "value": "5024" },
			{ "title": "AMERICAN NATIONAL", "value": "5031" }, { "title": "AMERIPRISE FINANCIAL GRP", "value": "5298" },
			{ "title": "AMICA", "value": "5036" }, { "title": "AUSTIN MUTUAL INS CO", "value": "5045" },
			{ "title": "AUTO-OWNERS", "value": "5047" }, { "title": "CHUBB", "value": "5066" }, { "title": "CINCINNATI FINANCIAL", "value": "5067" },
			{ "title": "COMPLIANT WITHOUT INSURANCE", "value": "0108" },
			{ "title": "COUNTRY INS", "value": "5079" }, { "title": "CWI - DEPLOYED MILITARY", "value": "1192" }, { "title": "DAIRYLAND", "value": "5082" },
			{ "title": "ENCOMPASS", "value": "5093" }, { "title": "ESURANCE", "value": "5096" }, { "title": "FARM BUREAU", "value": "5102" },
			{ "title": "FARMERS", "value": "5104" }, { "title": "FOREMOST", "value": "5112" }, { "title": "GEICO", "value": "5116" },
			{ "title": "GENERAL CASUALTY", "value": "5117" }, { "title": "GMAC", "value": "5122" }, { "title": "GRANGE MUTUAL", "value": "5126" },
			{ "title": "GRINNELL", "value": "5130" }, { "title": "HARLEYSVILLE", "value": "5135" }, { "title": "HARTFORD", "value": "5136" },
			{ "title": "HORACE MANN", "value": "5143" }, { "title": "INFINITY", "value": "5149" }, { "title": "KEMPER", "value": "5155" },
			{ "title": "LIBERTY MUTUAL", "value": "5157" }, { "title": "MAIN STREET AMERICA GRP", "value": "5299" }, { "title": "MENDOTA", "value": "5166" },
			{ "title": "METLIFE", "value": "5170" }, { "title": "MIDWEST FAMILY MUTUAL INS CO", "value": "5174" }, { "title": "NATIONAL FARMERS UNION", "value": "5183" },
			{ "title": "NATIONWIDE", "value": "5185" }, { "title": "NORTH STAR MUTUAL INS CO", "value": "5198" }, { "title": "OTHER STANDARD", "value": "0635" },
			{ "title": "OTHER NON-STANDARD", "value": "0636" }, { "title": "PROGRESSIVE", "value": "5226" }, { "title": "QBE INS", "value": "5228" },
			{ "title": "SAFECO", "value": "5240" }, { "title": "SECURA INS", "value": "5243" }, { "title": "SELECTIVE INS", "value": "5245" },
			{ "title": "STATE AUTO", "value": "5255" }, { "title": "STATE FARM", "value": "5256" }, { "title": "TITAN", "value": "5263" },
			{ "title": "TRAVELERS", "value": "5266" }, { "title": "UNITRIN", "value": "5276" }, { "title": "USAA", "value": "5278" },
			{ "title": "VICTORIA", "value": "5282" }, { "title": "WEST BEND INS", "value": "5286" },
			{ "title": "WESTERN NATIONAL", "value": "5289" }, { "title": "WESTFIELD", "value": "5292" }
		];
	}
}
