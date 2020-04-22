import { GetNodesLinkedTo, GetNodeLinkedTo, GetLinkBetween, existsLinkBetween } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodeTitle,
	ADD_LINK_BETWEEN_NODES,
	ComponentApiKeys,
	GetNodeByProperties,
	UPDATE_LINK_PROPERTY
} from '../../actions/uiactions';
import {
	LinkType,
	NodeProperties,
	NodeTypes,
	LinkProperties,
	LinkPropertyKeys,
	UITypes
} from '../../constants/nodetypes';
import AddEvent from '../AddEvent';
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from '../../utils/array';
import CreateModelPropertyGetterDC from '../CreateModelPropertyGetterDC';

export default function SetupViewTypeForCreate(args: any = {}) {
	const { node, eventType, eventTypeHandler, callback, uiType = UITypes.ElectronIO } = args;
	const graph = GetCurrentGraph();
	const result = [];
	if (!node) {
		throw new Error('missing node');
	}
	if (!eventType) {
		throw new Error('missing eventType');
	}
	if (!eventTypeHandler) {
		throw new Error('missing eventTypeHandler');
	}
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const { model, property, modelType } = GetViewTypeModelType(node);

	const properties = [ property ];

	const component = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.DefaultViewType
	})
		.filter((x: any) => GetNodeProp(x, NodeProperties.UIType) === uiType)
		.find((v: any) => GetNodeProp(v, NodeProperties.SharedComponent));
	if (component) {
		GetNodesLinkedTo(null, {
			id: component.id,
			link: LinkType.ListItem,
			componentType: NodeTypes.ComponentNode
		}).forEach((listItem: { id: any; }) => {
			GetNodesLinkedTo(null, {
				id: listItem.id,
				link: LinkType.Component,
				componentType: NodeTypes.ComponentNode
			}).forEach((subcomponent: { id: any; }) => {
				GetNodesLinkedTo(null, {
					id: subcomponent.id,
					link: LinkType.ComponentExternalApi,
					componentType: NodeTypes.ComponentExternalApi
				}).forEach((externalApi: { id: any; }) => {
					GetNodesLinkedTo(null, {
						id: externalApi.id,
						link: LinkType.ComponentExternalConnection,
						componentType: NodeTypes.ComponentApi
					}).forEach((externalConnection: { id: any; }) => {
						const link = GetLinkBetween(externalApi.id, externalConnection.id, graph);
						if (link) {
							result.push({
								operation: UPDATE_LINK_PROPERTY,
								options: {
									prop: LinkPropertyKeys.InstanceUpdate,
									value: false,
									id: link.id
								}
							});
						}
					});
				});
			});
		});
	}

	const propertyModel = modelType; /* GetNodeLinkedTo(null, {
    id: property.id,
    link: LinkType.PropertyLink
  }); */
	const valueExternalNodes = GetNodesLinkedTo(null, {
		id: node,
		link: LinkType.ComponentExternalApi,
		componentType: NodeTypes.ComponentExternalApi
	});

	const valueExternalNode = valueExternalNodes.find(
		(v: any) => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.Value
	);

	let modelKeyDC: null = null;
	const externalNodes = GetNodesLinkedTo(null, {
		id: node,
		link: LinkType.ComponentExternalApi,
		componentType: NodeTypes.ComponentExternalApi
	});
	const viewModelExternalNode = externalNodes.find(
		(v: any) => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.ViewModel
	);
	result.push(
		...externalNodes.map((externalNode: { id: any; }) => {
			const link = GetLinkBetween(node, externalNode.id, graph);
			if (link) {
				return {
					operation: UPDATE_LINK_PROPERTY,
					options: {
						prop: LinkPropertyKeys.InstanceUpdate,
						value: false,
						id: link.id
					}
				};
			}
			return null;
		})
	);
	result.push(
		...CreateModelKeyDC({
			model: `${GetNodeTitle(node)} ${GetNodeTitle(property)}`,
			modelId: model.id,
			viewPackages,
			callback: (modelKeyContext: { entry: any; }) => {
				modelKeyDC = modelKeyContext.entry;
			}
		}),
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				if (viewModelExternalNode) {
					return {
						target: modelKeyDC,
						source: viewModelExternalNode.id,
						properties: { ...LinkProperties.DataChainLink }
					};
				}
				return false;
			}
		}
	);

	let temp: any;

	result.push(
		...CreateModelPropertyGetterDC({
			model: propertyModel.id,
			property: property.id,
			viewPackages,
			propertyName: `${GetNodeTitle(node)}${GetNodeTitle(property.id)}`,
			modelName: GetNodeTitle(propertyModel),
			callback: (context: { entry: any; }) => {
				temp = context.entry;
			}
		}),
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					source: valueExternalNode.id,
					target: temp,
					properties: { ...LinkProperties.DataChainLink }
				};
			}
		}
	);

	const selector = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.Selector,
		[NodeProperties.Model]: modelType.id
	});

	if (selector) {
		result.push({
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					source: valueExternalNode.id,
					target: selector.id,
					properties: { ...LinkProperties.SelectorLink }
				};
			}
		});
	}

	result.push(
		...AddEvent({
			component: node,
			viewPackages,
			eventType,
			eventTypeHandler: properties.length ? eventTypeHandler : false,
			property: properties.length ? properties[0].id : null,
			callback
		})
	);
	return result;
}
SetupViewTypeForCreate.title = 'Setup View Type For Create';
SetupViewTypeForCreate.description = `Setup view-type nodes for create. Adds an onChange event, and sets the dataChain for viewmodel.`;

export function GetViewTypeModelType(node: any) {
	const graph = GetCurrentGraph();

	const properties = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.DefaultViewType,
		componentType: NodeTypes.Property
	});
	const models = GetNodesLinkedTo(graph, {
		id: node,
		link: LinkType.DefaultViewType
	}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);

	let model = models[0];

	let property = properties[0];
	let modelType = null;
	if (!property) {
		console.log('no property');
		const modelOptions = GetNodesLinkedTo(graph, {
			id: node,
			link: LinkType.DefaultViewType,
			componentType: NodeTypes.Model
		});
		if (modelOptions.length === 2) {
			if (
				existsLinkBetween(graph, {
					id: node,
					link: LinkType.LogicalChildren,
					source: modelOptions[0].id,
					target: modelOptions[1].id
				})
			) {
				[ model, property ] = modelOptions;
			} else if (
				existsLinkBetween(graph, {
					id: node,
					link: LinkType.LogicalChildren,
					source: modelOptions[1].id,
					target: modelOptions[0].id
				})
			) {
				[ property, model ] = modelOptions;
				modelType = property;
			} else {
				throw new Error(
					'unhandled: the defaultviewtype should have two models that are connected to each other in a child/parent relationship'
				);
			}
		} else {
			throw new Error(`an incorrect number of models is connected to the viewtype ${modelOptions.length}`);
		}
	} else {
		modelType = GetNodeLinkedTo(graph, {
			id: property.id,
			link: LinkType.PropertyLink,
			componentType: NodeTypes.Model
		});
	}
	return {
		model,
		property,
		modelType
	};
}
