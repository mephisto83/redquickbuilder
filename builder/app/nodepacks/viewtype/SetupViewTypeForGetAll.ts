import { GetNodesLinkedTo, GetNodeLinkedTo, GetLinkBetween } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetNodeProp,
	GetNodeTitle,
	ADD_LINK_BETWEEN_NODES,
	ComponentApiKeys,
	REMOVE_LINK_BETWEEN_NODES,
	GetNodeByProperties,
	UPDATE_LINK_PROPERTY
} from '../../actions/uiactions';
import { LinkType, NodeProperties, NodeTypes, LinkProperties, LinkPropertyKeys } from '../../constants/nodetypes';
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from '../../utils/array';
import { GetViewTypeModelType } from './SetupViewTypeForCreate';
import CreateModelPropertyGetterDC from '../CreateModelPropertyGetterDC';

export default function SetupViewTypeForGetAll(args: any = {}) {
	const { node } = args;
	const graph = GetCurrentGraph();
	const result = [];
	if (!node) {
		throw new Error('missing node');
	}
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const { model, property, modelType } = GetViewTypeModelType(node);

	const propertyModel = GetNodeLinkedTo(null, {
		id: property.id,
		link: LinkType.PropertyLink
	});
	const externalNodes = GetNodesLinkedTo(null, {
		id: node,
		link: LinkType.ComponentExternalApi,
		componentType: NodeTypes.ComponentExternalApi
	});
	const valueExternalNode = externalNodes.find(
		(v: any) => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.Value
	);

	let modelKeyDC: any = null;
	const viewModelExternalNode = GetNodesLinkedTo(null, {
		id: node,
		link: LinkType.ComponentExternalApi,
		componentType: NodeTypes.ComponentExternalApi
	}).find((v: any) => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.ViewModel);
	result.push(
		...externalNodes.map((externalNode: any) => {
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
		...GetNodesLinkedTo(null, {
			id: viewModelExternalNode.id,
			link: LinkType.DataChainLink,
			componentType: NodeTypes.DataChain
		}).map((dc: { id: any; }) => ({
			operation: REMOVE_LINK_BETWEEN_NODES,
			options: {
				target: dc.id,
				source: viewModelExternalNode.id
			}
		}))
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
	result.push(
		...GetNodesLinkedTo(null, {
			id: valueExternalNode.id,
			link: LinkType.DataChainLink,
			componentType: NodeTypes.DataChain
		}).map((dc: { id: any; }) => ({
			operation: REMOVE_LINK_BETWEEN_NODES,
			options: {
				target: dc.id,
				source: valueExternalNode.id
			}
		}))
	);

	let temp: any;
	result.push(
		...CreateModelPropertyGetterDC({
			model: propertyModel.id,
			viewPackages,
			property: property.id,
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

	return result.filter((x) => x);
}
SetupViewTypeForGetAll.title = 'Setup View Type For GetAll';
SetupViewTypeForGetAll.description = `Setup view-type nodes for create. Sets the dataChain for viewmodel.`;