import { NodeProperties, NodeTypes, LinkProperties } from '../constants/nodetypes';
import {
	GetComponentApiNode,
	GetNodeById,
	GetComponentExternalApiNode,
	ADD_NEW_NODE,
	ADD_LINK_BETWEEN_NODES
} from '../actions/uiactions';
import { existsLinkBetween } from '../methods/graph_methods';
export interface ComponentApiSetup {
	id: string | any;
	external: string | any;
	internal: string | any;
	skipExternal?: boolean;
}
let func: any = function SetupApiBetweenComponent(args: {
	component_a: ComponentApiSetup;
	viewPackages?: any;
	component_b: ComponentApiSetup;
}) {
	//
	let result = [];

	if (!args.component_a) {
		throw 'missing component_a';
	}
	if (!args.component_b) {
		throw 'missing component_b';
	}
	if (!args.component_a.id) {
		throw 'missing component_a.id';
	}
	if (!args.component_b.id) {
		throw 'missing component_b.id';
	}
	if (!args.component_a.skipExternal)
		if (!args.component_a.external) {
			throw 'missing component_a.external';
		}
	if (!args.component_a.internal) {
		throw 'missing component_a.internal';
	}

	if (!args.component_b.external) {
		throw 'missing component_b.external';
	}
	if (!args.component_b.internal) {
		throw 'missing component_b.internal';
	}

	let { viewPackages } = args;

	result.push(function(graph: any) {
		let result = [];
		let a_id: any = getId(args.component_a.id);
		let b_id: any = getId(args.component_b.id);

		let a_external_id: any = getId(args.component_a.external);
		let b_external_id: any = getId(args.component_b.external);

		let a_internal_id: any = getId(args.component_a.internal);
		let b_internal_id: any = getId(args.component_b.internal);

		let componentA: any = GetNodeById(a_id, graph);
		let componentB: any = GetNodeById(b_id, graph);

		let componentA_external_node = GetComponentExternalApiNode(a_external_id, componentA.id, graph);
		let componentB_external_node = GetComponentExternalApiNode(b_external_id, componentB.id, graph);
		let componentB_internal_node = GetComponentApiNode(b_internal_id, componentB.id, graph);
		let componentA_internal_node = GetComponentApiNode(a_internal_id, componentA.id, graph);

		if (componentA && componentB) {
			if (!args.component_a.skipExternal)
				if (!componentA_external_node) {
					result.push({
						operation: ADD_NEW_NODE,
						options: function() {
							return {
								nodeType: NodeTypes.ComponentExternalApi,
								parent: componentA.id,
								groupProperties: {},
								properties: {
									...viewPackages,
									[NodeProperties.UIText]: a_external_id
								},
								linkProperties: {
									properties: { ...LinkProperties.ComponentExternalApi }
								},
								callback: (node: any) => {
									componentA_external_node = node;
								}
							};
						}
					});
				}
			if (!componentA_internal_node) {
				result.push({
					operation: ADD_NEW_NODE,
					options: function() {
						return {
							nodeType: NodeTypes.ComponentApi,
							parent: componentA.id,
							groupProperties: {},
							properties: {
								...viewPackages,
								[NodeProperties.UIText]: a_internal_id
							},
							linkProperties: {
								properties: { ...LinkProperties.ComponentInternalApi }
							},
							callback: (node: any) => {
								componentA_internal_node = node;
							}
						};
					}
				});
			}
			if (!args.component_a.skipExternal)
				result.push({
					operation: ADD_LINK_BETWEEN_NODES,
					options: function(graph: any) {
						let thereIsAnExistingLink = existsLinkBetween(graph, {
							source: componentA_internal_node.id,
							target: componentA_external_node.id
						});
						if (!thereIsAnExistingLink)
							return {
								source: componentA_internal_node.id,
								target: componentA_external_node.id,
								properties: { ...LinkProperties.ComponentInternalConnection }
							};
						return null;
					}
				});

			if (!componentB_external_node) {
				result.push({
					operation: ADD_NEW_NODE,
					options: function() {
						return {
							nodeType: NodeTypes.ComponentExternalApi,
							parent: componentB.id,
							groupProperties: {},
							properties: {
								...viewPackages,
								[NodeProperties.UIText]: b_external_id
							},
							linkProperties: {
								properties: { ...LinkProperties.ComponentExternalApi }
							},
							callback: (node: any) => {
								componentB_external_node = node;
							}
						};
					}
				});
			}
			if (!componentB_internal_node) {
				result.push({
					operation: ADD_NEW_NODE,
					options: function() {
						return {
							nodeType: NodeTypes.ComponentApi,
							parent: componentB.id,
							groupProperties: {},
							properties: {
								...viewPackages,
								[NodeProperties.UIText]: b_internal_id
							},
							linkProperties: {
								properties: { ...LinkProperties.ComponentInternalApi }
							},
							callback: (node: any) => {
								componentB_internal_node = node;
							}
						};
					}
				});
			}
			result.push({
				operation: ADD_LINK_BETWEEN_NODES,
				options: function(graph: any) {
					let thereIsAnExistingLink = existsLinkBetween(graph, {
						source: componentB_internal_node.id,
						target: componentB_external_node.id
					});
					if (!thereIsAnExistingLink)
						return {
							source: componentB_internal_node.id,
							target: componentB_external_node.id,
							properties: { ...LinkProperties.ComponentInternalConnection }
						};
					return null;
				}
			});

			result.push({
				operation: ADD_LINK_BETWEEN_NODES,
				options: function(graph: any) {
					let thereIsAnExistingLink = existsLinkBetween(graph, {
						source: componentB_external_node.id,
						target: componentA_internal_node.id
					});
					if (!thereIsAnExistingLink)
						return {
							source: componentB_external_node.id,
							target: componentA_internal_node.id,
							properties: { ...LinkProperties.ComponentExternalConnection }
						};
					return null;
				}
			});
		}
		return result;
	});

	return result;
};
function getId(val: () => any) {
	if (typeof val === 'function') {
		return val();
	}
	return val;
}
func.description = 'Sets the inner api component value to use the local context.';
export default func;
