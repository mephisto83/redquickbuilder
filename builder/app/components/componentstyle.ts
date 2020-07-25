import { GUID } from '../actions/uiactions';
export enum ComponentStyleType {
	ComponentApi = 'ComponentApi'
}

export default interface ComponentStyle {
	id: string;
	componentApi: string;
	styleComponent: string;
	componentStyleType: ComponentStyleType;
};

export function CreateComponentStyle(): ComponentStyle {
	return {
		id: GUID(),
    componentApi: '',
    styleComponent: '',
		componentStyleType: ComponentStyleType.ComponentApi
	};
}
