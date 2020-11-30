import { GUID } from '../actions/uiActions';
export enum ComponentStyleType {
	ComponentApi = 'ComponentApi'
}

export default interface ComponentStyle {
	negate: boolean;
	id: string;
	onComponent: boolean;
	componentApi: string;
	styleComponent: string;
	componentStyleType: ComponentStyleType;
};

export function CreateComponentStyle(componentApi?: string, style?: string, negate: boolean = false): ComponentStyle {
	return {
		id: GUID(),
		componentApi: componentApi || '',
		styleComponent: style || '',
		negate: negate,
		onComponent: true,
		componentStyleType: ComponentStyleType.ComponentApi
	};
}
