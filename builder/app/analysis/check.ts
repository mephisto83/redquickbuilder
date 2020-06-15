import { GetValidationMethodForViewType } from '../nodepacks/batch/SetupViewTypes';
import { GetNodeProp, NodesByType, setVisual, GetDispatchFunc, GetStateFunc, GetNodeTitle } from '../actions/uiactions';
import { NodeProperties, Methods, NodeTypes } from '../constants/nodetypes';

export const GetValidationMethodForViewType_ = 'GetValidationMethodForViewType';
export default function Check(names: string | string[]) {
	if (!Array.isArray(names)) {
		names = [ names ];
	}
	names.forEach((name: string) => {
		switch (name) {
			case GetValidationMethodForViewType_:
				CheckGetValidationMethodForViewType();
				break;
		}
	});
}

export function CheckGetValidationMethodForViewType() {
	const viewTypes = NodesByType(null, NodeTypes.ViewType);
	let res = viewTypes
		.filter((x: any) => GetNodeProp(x, NodeProperties.ViewType) !== Methods.Delete)
		.map((node: any, index: any, length: any) => {
			let method = GetValidationMethodForViewType(node);
			return {
				ok: !!method,
				details: {
					method: method ? GetNodeTitle(method.id) : null
				},
				node: node.id
			};
		});

	setVisual(GetValidationMethodForViewType_, res)(GetDispatchFunc(), GetStateFunc());
}
