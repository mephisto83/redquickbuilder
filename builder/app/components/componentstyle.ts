import { GUID } from '../actions/uiactions';
export enum ComponentStyleType {
	DataChain = 'DataChain'
}

export default interface ComponentStyle {
	id: string;
	dataChain: string;
	componentStyleType: ComponentStyleType;
};

export function CreateComponentStyle(): ComponentStyle {
	return {
		id: GUID(),
		dataChain: '',
		componentStyleType: ComponentStyleType.DataChain
	};
}
