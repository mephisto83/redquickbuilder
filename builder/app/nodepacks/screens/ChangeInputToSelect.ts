import {
	NodesByType,
	GetChildComponentAncestors,
	GetCurrentGraph,
	$addComponentApiNodes,
	ADD_LINK_BETWEEN_NODES,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	UPDATE_NODE_PROPERTY
} from '../../actions/uiactions';
import { NodeTypes, LinkType, LinkProperties, NodeProperties } from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';
import { GetNodeLinkedTo, GetNodesLinkedTo } from '../../methods/graph_methods';
import EnumerationDropdownSource from '../datachain/EnumerationDropdownSource';
import { ComponentTypeKeys } from '../../constants/componenttypes';

export default function ChangeInputToSelect(filter?: any) {
	filter = filter || (() => true);
	let graph = GetCurrentGraph();
	let screens = NodesByType(null, NodeTypes.Screen).filter(filter);
	let enumerationDic: { [str: string]: string } = {};
	let components = NodesByType(null, NodeTypes.ComponentNode).filter((node: Node) => {
		let property = GetNodeLinkedTo(graph, {
			id: node.id,
			link: LinkType.PropertyLink,
			component: NodeTypes.Property
		});
		if (property) {
			let enumeration = GetNodeLinkedTo(graph, {
				id: property.id,
				link: LinkType.Enumeration,
				componentType: NodeTypes.Enumeration
			});
			if (enumeration) {
				enumerationDic[node.id] = enumeration.id;
			}
			return enumeration;
		}
		return false;
	});
	let result: any[] = [];
	screens.forEach((screen: Node) => {
		let screensComponents = components.filter((component: Node) => {
			let ancestors = GetChildComponentAncestors(component.id);
			return ancestors.indexOf(screen.id) !== -1;
		});

		screensComponents.forEach((sc: Node) => {
			let externalApi: string;
			let dataChain: string;
			result.push(
				...EnumerationDropdownSource({
					enumerationId: enumerationDic[sc.id],
					callback: (context: { entry: string }) => {
						dataChain = context.entry;
					}
				})
			);
			result.push(
				...$addComponentApiNodes(sc.id, 'options', null, null, (context: { externalApi: string }) => {
					externalApi = context.externalApi;
				}),
				function() {
					return {
						operation: UPDATE_NODE_PROPERTY,
						options() {
							return {
								id: sc.id,
								properties: {
									[NodeProperties.ComponentType]: ComponentTypeKeys.Dropdown
								}
							};
						}
					};
				},
				function() {
					return {
						operation: ADD_LINK_BETWEEN_NODES,
						options() {
							return {
								target: dataChain,
								source: externalApi,
								properties: {
									...LinkProperties.DataChainLink
								}
							};
						}
					};
				}
			);
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
