import {
	ADD_LINK_BETWEEN_NODES,
	LinkProperties,
	ADD_NEW_NODE,
	NodesByType,
	NodeProperties,
	GetNodeTitle,
	CHANGE_NODE_PROPERTY
} from '../../actions/uiActions';
import { NodeTypes, LinkType } from '../../constants/nodetypes';
import { existsLinkBetween } from '../../methods/graph_methods';

export default function AttachMethodToMaestro(args: any) {
	const { methodNodeId, modelId, options, viewPackage } = args;

	let controller: any = false;
	let maestro: any = false;
	if (options && options.maestro) {
		return [
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						source: options.maestro,
						target: methodNodeId,
						properties: {
							...LinkProperties.FunctionLink
						}
					};
				}
			}
		];
	}
	return [
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const controllerInstance = NodesByType(null, NodeTypes.Controller).find((x: any) =>
					existsLinkBetween(graph, {
						target: modelId,
						source: x.id,
						link: LinkType.ModelTypeLink
					})
				);

				if (!controllerInstance) {
					return {
						nodeType: NodeTypes.Controller,
						properties: {
							...viewPackage || {},
							[NodeProperties.UIText]: `${GetNodeTitle(modelId)} Controller`
						},
						links: [
							{
								target: modelId,
								linkProperties: {
									properties: {
										...LinkProperties.ModelTypeLink
									}
								}
							}
						],
						callback: (_controller: any) => {
							controller = _controller;
						}
					};
				}
				controller = controllerInstance;
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				return {
					id: controller.id,
					value: 'systemUser',
					prop: NodeProperties.CodeUser
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const maestroInstance = NodesByType(null, NodeTypes.Maestro).find((x: any) =>
					existsLinkBetween(graph, {
						target: modelId,
						source: x.id,
						link: LinkType.ModelTypeLink
					})
				);

				if (!maestroInstance) {
					return {
						nodeType: NodeTypes.Maestro,
						properties: {
							...viewPackage || {},
							[NodeProperties.UIText]: `${GetNodeTitle(modelId)} Maestro`
						},
						links: [
							{
								target: modelId,
								linkProperties: {
									properties: {
										...LinkProperties.ModelTypeLink
									}
								}
							}
						],
						callback: (_maestro: any) => {
							maestro = _maestro;
						}
					};
				}
				maestro = maestroInstance;
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					source: controller.id,
					target: maestro.id,
					properties: {
						...LinkProperties.MaestroLink
					}
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					source: maestro.id,
					target: methodNodeId,
					properties: {
						...LinkProperties.FunctionLink
					}
				};
			}
		}
	];
}
