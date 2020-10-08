import {
	NodesByType,
	GetLogicalChildren,
	GetNodeProp,
	GetNodeTitle,
	ADD_NEW_NODE,
	GetCurrentGraph,
	GetModelReferencedByProperty
} from '../../actions/uiactions';
import { NodeTypes, LinkType, NodeProperties, LinkProperties } from '../../constants/nodetypes';
import { GetNodesLinkedTo, existsLinkBetween } from '../../methods/graph_methods';
import { ViewTypes } from '../../constants/viewtypes';
import { uuidv4 } from '../../utils/array';
import { Node } from '../../methods/graph_types';

export default async function CreateViewTypes(progress?: any) {
	const models = NodesByType(null, NodeTypes.Model);
	const result: any = [];
	const createViewTypes: any = {};
	await models.forEachAsync(async (model: any, index: any) => {
		const modelChildren = GetLogicalChildren(model.id);
		const modelProperties = GetNodesLinkedTo(null, {
			id: model.id,
			componentType: NodeTypes.Property,
			link: LinkType.ModelTypeLink
		}).filter((x: any) => GetNodeProp(x, NodeProperties.UseModelAsType));
		const modelLinkedNodes = GetNodesLinkedTo(null, {
			id: model.id,
			link: LinkType.DefaultViewType,
			componentType: NodeTypes.ViewType
		});
		[ ...modelProperties, ...modelChildren ].forEach((child) => {
			const childModelLinkedNodes = GetNodesLinkedTo(null, {
				id: child.id,
				link: LinkType.DefaultViewType,
				componentType: NodeTypes.ViewType
			});
			const commonViewTypes = childModelLinkedNodes.intersection(
				modelLinkedNodes,
				(x: any, y: any) => y.id === x.id
			);
			const isProperty = !!modelProperties.find((v: Node) => v.id === child.id); /// GetNodeProp(child, NodeProperties.UseModelAsType);
			Object.keys(ViewTypes)
				.filter((x) => !commonViewTypes.some((cvt: any) => GetNodeProp(cvt, NodeProperties.ViewType) === x))
				.forEach((viewType) => {
					if (
						!createViewTypes[
							`${isProperty ? model.id : child.id} ${isProperty ? child.id : model.id} ${viewType}`
						]
					) {
						createViewTypes[
							`${isProperty ? model.id : child.id} ${isProperty ? child.id : model.id} ${viewType}`
						] = true;
						let isPluralComponent = !isProperty;

						result.push(
							...setupDefaultViewType({
								properties: {
									...LinkProperties.DefaultViewType,
									viewType
								},
								target: isProperty ? model.id : child.id,
								isPluralComponent,
								source: isProperty ? child.id : model.id,
								viewCurrentType: viewType
							})
						);
					}
				});
		});
		if (progress) {
			await progress(index / models.length);
		}
	});

	return result;
}

CreateViewTypes.title = 'Create View Type Connections';
// export function ConnectViewType() {
//   let connectto = [];
//   Object.values(ViewTypes).map(viewType => {

//     connectto = getViewTypeEndpointsForDefaults(viewType, null, nodeId);
//     connectto.map(ct => {

//       this.props.setSharedComponent({
//         properties: {
//           ...LinkProperties.DefaultViewType,
//           viewType
//         },
//         source: ct.id,
//         target: properties.autoConnectViewType
//       })
//     });
//   });
// }

export function setupDefaultViewType(args: any) {
	const { properties, target, source, viewCurrentType, isPluralComponent } = args;
	const result = [];
	const graph = GetCurrentGraph();
	let isPropertyLink = false;
	if (
		existsLinkBetween(graph, {
			target,
			source,
			type: LinkType.ModelTypeLink
		})
	) {
		const isUsedAsModelType = GetNodeProp(source, NodeProperties.UseModelAsType);
		if (isUsedAsModelType) {
			const targetedTypeNode = GetNodeProp(source, NodeProperties.UIModelType);
			if (targetedTypeNode === target) {
				isPropertyLink = true;
			}
		}
	}

	const rightLink =
		isPropertyLink ||
		existsLinkBetween(graph, {
			target,
			source,
			type: LinkType.LogicalChildren
		});
	if (rightLink) {
		const useModelAsType = GetNodeProp(target, NodeProperties.UseModelAsType);
		result.push(
			...[ viewCurrentType ].map((viewType) => {
				const sibling = uuidv4();
				return {
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.ViewType,
							properties: {
								[NodeProperties.IsPluralComponent]: isPluralComponent,
								[NodeProperties.ViewType]: viewType,
								[NodeProperties.UIText]: `[${viewType}] ${GetNodeTitle(source)} => ${GetNodeTitle(
									target
								)} ${isPluralComponent ? 'Plural' : ''}`
							},
							...useModelAsType ? { parent: target, groupProperties: {} } : {},
							links: [
								{
									target,
									linkProperties: {
										properties: {
											...properties,
											viewType,
											sibling,
											target
										}
									}
								},
								{
									target: source,
									linkProperties: {
										properties: {
											...properties,
											viewType,
											sibling,
											source
										}
									}
								}
							]
						};
					}
				};
			})
		);
	}
	return result;
}
