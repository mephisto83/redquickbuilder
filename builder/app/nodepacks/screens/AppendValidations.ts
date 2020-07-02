import {
	GetNodeProp,
	GetNodeTitle,
	ComponentApiKeys,
	GetModelPropertyChildren,
	ADD_LINK_BETWEEN_NODES,
	GetNodeById,
	$addComponentApiNodes,
	GetNodeByProperties
} from '../../actions/uiactions';
import { NodeProperties, LinkType, LinkProperties, LinkPropertyKeys, NodeTypes } from '../../constants/nodetypes';
import { GetNodesLinkedTo, GetNodeLinkedTo } from '../../methods/graph_methods';
import CreateValidatorForProperty from '../CreateValidatorForProperty';
import { ComponentTypeKeys } from '../../constants/componenttypes';
import CreateValidatorForObject from '../CreateValidatorForObject';

export default function AppendValidations({
	subcomponents,
	component,
	screen_option,
	InstanceUpdate = true,
	viewPackages,
	method
}: any) {
	if (!subcomponents) {
		throw new Error('no subcomponents');
	}
	const nonExecuteSubComponents = subcomponents.filter(
		(x: string | Node) => !GetNodeProp(x, NodeProperties.ExecuteButton)
	);
	const executeButtons = subcomponents.filter((x: any | string | Node) =>
		GetNodeProp(x, NodeProperties.ExecuteButton)
	);
	const componentInternalValueApi = GetNodesLinkedTo(null, {
		id: component.id,
		link: LinkType.ComponentInternalApi,
		componentType: NodeTypes.ComponentApi
	}).find((componentApi: any) => GetNodeTitle(componentApi) === ComponentApiKeys.Value);
	const result: any = [];
	const modelType = GetNodeProp(screen_option, NodeProperties.Model);
	const selector = modelType
		? GetNodeByProperties({
				[NodeProperties.NODEType]: NodeTypes.Selector,
				[NodeProperties.Model]: modelType
			})
		: null;

	if (nonExecuteSubComponents.length) {
		nonExecuteSubComponents.forEach((subcomponent: any) => {
			const componentType = GetNodeProp(subcomponent, NodeProperties.ComponentType);
			let externalValidationApi: any;
			switch (componentType) {
				case ComponentTypeKeys.Button:
					break;
				default:
					externalValidationApi = GetNodesLinkedTo(null, {
						id: subcomponent.id,
						link: LinkType.ComponentExternalApi
					}).find((v: any) => GetNodeTitle(v) === ComponentApiKeys.Error);
					if (externalValidationApi) {
						const modelId = GetNodeProp(screen_option, NodeProperties.Model);
						let propertyId = GetNodeProp(subcomponent, NodeProperties.Property);
						propertyId =
							propertyId ||
							GetNodeLinkedTo(null, {
								id: subcomponent.id,
								link: LinkType.PropertyLink,
								properties: {
									[LinkPropertyKeys.ComponentProperty]: true
								}
							});
						if (!propertyId) {
							propertyId = GetModelPropertyChildren(modelId).find(
								(v: any) => GetNodeTitle(v) === GetNodeTitle(subcomponent)
							);
						}
						if (propertyId && propertyId.id) {
							propertyId = propertyId.id;
						}
						if (!GetNodeById(propertyId)) {
							return;
						}
						let validatorNode: any = null;
						const methodType = GetNodeProp(method, NodeProperties.MethodType);
						result.push(
							...CreateValidatorForProperty({
								modelText: GetNodeTitle(modelId),
								propertyText: GetNodeTitle(propertyId),
								model: modelId,
								property: propertyId,
								method,
								methodType,
								viewPackages,
								callback: (context: { entry: any }) => {
									validatorNode = context.entry;
								}
							}),
							{
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										target: validatorNode,
										source: externalValidationApi.id,
										properties: { ...LinkProperties.DataChainLink }
									};
								}
							}
						);
					}
					break;
			}
		});
	}
	if (executeButtons.length) {
		executeButtons.forEach((button: any) => {
			const componentType = GetNodeProp(button, NodeProperties.ComponentType);
			let externalValidationApi: { id: any };
			switch (componentType) {
				default:
					result.push((ggraph: any) => {
						const res = [];
						externalValidationApi = GetNodesLinkedTo(ggraph, {
							id: button.id,
							link: LinkType.ComponentExternalApi
						}).find((v: any) => GetNodeTitle(v) === ComponentApiKeys.Error);
						if (!externalValidationApi) {
							res.push(...$addComponentApiNodes(button.id, ComponentApiKeys.Error, null, viewPackages));
						}
						return res;
					});
					result.push((ggraph: any) => {
						externalValidationApi = GetNodesLinkedTo(ggraph, {
							id: button.id,
							link: LinkType.ComponentExternalApi
						}).find((v: any) => GetNodeTitle(v) === ComponentApiKeys.Error);
						if (externalValidationApi) {
							const modelId = GetNodeProp(screen_option, NodeProperties.Model);
							let validatorNode: null = null;
							let targetValidationMethod = GetNodeProp(button, NodeProperties.ValidationMethodTarget);
							const methodType = GetNodeProp(targetValidationMethod || method, NodeProperties.MethodType);
							return [
								...CreateValidatorForObject({
									model: GetNodeTitle(modelId),
									modelId,
									method,
									methodType,
									viewPackages,
									callback: (context: { entry: any }) => {
										validatorNode = context.entry;
									}
								}),
								{
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: validatorNode,
											source: externalValidationApi.id,
											properties: { ...LinkProperties.DataChainLink }
										};
									}
								},
								{
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: componentInternalValueApi.id,
											source: externalValidationApi.id,
											properties: {
												...LinkProperties.ComponentExternalConnection,
												[LinkPropertyKeys.InstanceUpdate]: InstanceUpdate
											}
										};
									}
								},
								selector
									? {
											operation: ADD_LINK_BETWEEN_NODES,
											options() {
												return {
													source: externalValidationApi.id,
													target: selector.id,
													properties: { ...LinkProperties.SelectorLink }
												};
											}
										}
									: null
							];
						}
						return [];
					});
					break;
			}
		});
	}
	return result;
}
