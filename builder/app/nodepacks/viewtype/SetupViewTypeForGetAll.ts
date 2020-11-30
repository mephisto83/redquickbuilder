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
} from '../../actions/uiActions';
import { LinkType, NodeProperties, NodeTypes, LinkProperties, LinkPropertyKeys } from '../../constants/nodetypes';
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from '../../utils/array';
import { GetViewTypeModelType } from './SetupViewTypeForCreate';
import CreateModelPropertyGetterDC from '../CreateModelPropertyGetterDC';
import { CreateNewNode } from '../../actions/uiActions';
import { DataChainFunctionKeys } from '../../constants/datachain';
import { Node } from '../../methods/graph_types';

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
	if (viewModelExternalNode) {
		result.push(
			...GetNodesLinkedTo(null, {
				id: viewModelExternalNode.id,
				link: LinkType.DataChainLink,
				componentType: NodeTypes.DataChain
			}).map((dc: { id: any }) => ({
				operation: REMOVE_LINK_BETWEEN_NODES,
				options: {
					target: dc.id,
					source: viewModelExternalNode.id
				}
			}))
		);
	}

	result.push(
		...CreateModelKeyDC({
			model: `${GetNodeTitle(node)} ${GetNodeTitle(property)}`,
			modelId: model.id,
			viewPackages,
			callback: (modelKeyContext: { entry: any }) => {
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
	if (valueExternalNode) {
		result.push(
			...GetNodesLinkedTo(null, {
				id: valueExternalNode.id,
				link: LinkType.DataChainLink,
				componentType: NodeTypes.DataChain
			}).map((dc: { id: any }) => ({
				operation: REMOVE_LINK_BETWEEN_NODES,
				options: {
					target: dc.id,
					source: valueExternalNode.id
				}
			}))
		);
	}
	let temp: any;
	// If the property is a reference to a model, then we can assume it will be an array of strings referencing the instances.
	// *11/21/2020* Just because the property is a reference to a model ,doesn't mean we can assume its an array.
	// *11/21/2020* If both the property and the model are models, then it should be an array.
	if (GetNodeProp(property, NodeProperties.NODEType) === NodeTypes.Model && GetNodeProp(model, NodeProperties.NODEType) === NodeTypes.Model) {
		let dataChainTemplate = `
    function load#{{"key":"modelProperty"}}#PropertiesFrom#{{"key":"model"}}#s($obj: { blur: any, dirty: any, focus: any, focused: any, object: #{{"key":"model"}}# }) {
      if(!$obj || !$obj.object) {
          return [];
      }

      let { #{{"key":"modelPropertyJs","js":true}}# } = $obj.object;

      if(!Array.isArray(#{{"key":"modelPropertyJs","js":true}}#)) {
        return [];
      }

      return (#{{"key":"modelPropertyJs","js":true}}# || []).map((id:string)=>{
          let item = GetItem(Models.#{{"key":"modelProperty"}}#, id);
          if (!item && id && typeof id === 'string') {
            fetchModel(Models.#{{"key":"modelProperty"}}#, id);
          }
          return item && item.id ? item.id : item;
      });
  }

  `;
		result.push(
			() => {
				let lambdaInsertArgumentValues = {
					model: { model: model.id },
					modelProperty: { model: property.id },
					modelPropertyJs: { model: property.id }
				};
				let name = `Load ${GetNodeTitle(property)} Properties From ${GetNodeTitle(model)}`;
				let found = GetNodeByProperties({
					[NodeProperties.DataChainPurpose]: name,
					[NodeProperties.NODEType]: NodeTypes.DataChain
				});
				if (found) {
					temp = found.id;
					return [];
				}
				return [
					CreateNewNode(
						{
							[NodeProperties.UIText]: name,
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.AutoCalculate]: true,
							[NodeProperties.AsOutput]: true,
							[NodeProperties.EntryPoint]: true,
							[NodeProperties.DataChainPurpose]: name,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
							[NodeProperties.LambdaInsertArguments]: lambdaInsertArgumentValues,
							[NodeProperties.Lambda]: dataChainTemplate
						},
						(res: Node) => {
							temp = res.id;
						}
					),
					function () {
						return {
							operation: ADD_LINK_BETWEEN_NODES,
							options: {
								target: property.id,
								source: temp,
								properties: { ...LinkProperties.LambdaInsertArguments }
							}
						};
					},
					function () {
						return {
							operation: ADD_LINK_BETWEEN_NODES,
							options: {
								target: model.id,
								source: temp,
								properties: { ...LinkProperties.LambdaInsertArguments }
							}
						};
					}
				];
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (valueExternalNode) {
						return {
							source: valueExternalNode.id,
							target: temp,
							properties: { ...LinkProperties.DataChainLink }
						};
					}
				}
			}
		);
	} else {
		result.push(
			...CreateModelPropertyGetterDC({
				model: propertyModel.id,
				viewPackages,
				property: property.id,
				propertyName: `${GetNodeTitle(node)}${GetNodeTitle(property.id)}`,
				modelName: GetNodeTitle(propertyModel),
				callback: (context: { entry: any }) => {
					temp = context.entry;
				}
			}),
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (valueExternalNode) {
						return {
							source: valueExternalNode.id,
							target: temp,
							properties: { ...LinkProperties.DataChainLink }
						};
					}
				}
			}
		);
	}
	let selectorModelType: Node = modelType;
	if (GetNodeProp(property, NodeProperties.NODEType) === NodeTypes.Model) {
		selectorModelType = model;
	}
	const selector = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.Selector,
		[NodeProperties.Model]: selectorModelType.id
	});

	if (selector) {
		result.push({
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				if (valueExternalNode) {
					return {
						source: valueExternalNode.id,
						target: selector.id,
						properties: { ...LinkProperties.SelectorLink }
					};
				}
			}
		});
	}

	return result.filter((x) => x);
}
SetupViewTypeForGetAll.title = 'Setup View Type For GetAll';
SetupViewTypeForGetAll.description = `Setup view-type nodes for create. Sets the dataChain for viewmodel.`;
