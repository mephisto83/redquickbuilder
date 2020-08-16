import { GetNodesLinkedTo } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodesByProperties,
	REMOVE_NODE,
	ScreenOptionFilter,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc
} from '../../actions/uiactions';
import { LinkType, NodeProperties } from '../../constants/nodetypes';
import { ComponentLifeCycleEvents } from '../../constants/componenttypes';

export default function ClearScreenConnection(args: any = {}) {
	let { node } = args;

	const graph = GetCurrentGraph();
	const screenOptions = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.ScreenOptions
	}).filter(ScreenOptionFilter);
	let result: any[] = [];

	screenOptions.forEach((screenOptionInstance: { id: any }) => {
		const lifeCylcleMethods = GetNodesLinkedTo(graph, {
			id: screenOptionInstance.id,
			link: LinkType.LifeCylceMethod
		});

		lifeCylcleMethods
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === ComponentLifeCycleEvents.ComponentDidMount)
			.forEach((lifeCylcleMethod: { id: any }) => {
				const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
					id: lifeCylcleMethod.id,
					link: LinkType.LifeCylceMethodInstance
				});
				lifeCylcleMethodInstances.forEach((lifeCylcleMethodInstance: any) => {
					const vp = GetNodeProp(lifeCylcleMethodInstance, NodeProperties.ViewPackage);
					if (vp) {
						const inPackageNodes = GetNodesByProperties({
							[NodeProperties.ViewPackage]: vp
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
				});
			});
	});
	result = [ ...result ].filter((x) => x);
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
