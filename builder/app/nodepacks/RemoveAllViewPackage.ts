import { NodeProperties } from '../constants/nodetypes';
import { GetNodesByProperties, REMOVE_NODE } from '../actions/uiActions';

export default function RemoveAllViewPackage(args: any = {}) {
	const result: any = [];
	const { view } = args;
	if (view) {
		const inPackageNodes = GetNodesByProperties({
			[NodeProperties.ViewPackage]: view
		});

		inPackageNodes.forEach((inPackageNode) => {
			result.push({
				operation: REMOVE_NODE,
				options() {
					return {
						id: inPackageNode.id
					};
				}
			});
		});
	}
	return result;
}
