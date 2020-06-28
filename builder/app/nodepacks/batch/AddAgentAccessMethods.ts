import {
	NodesByType,
	GetNodeTitle,
	executeGraphOperations,
	GetDispatchFunc,
	GetStateFunc,
	GetCurrentGraph,
	GetLinkProperty,
	GetNodeById
} from '../../actions/uiactions';
import { NodeTypes, LinkType, Methods, LinkPropertyKeys } from '../../constants/nodetypes';
import { MethodFunctions, HTTP_METHODS, FunctionTypes } from '../../constants/functiontypes';
import { CreateAgentFunction } from '../../constants/nodepackages';
import { findLink, SetPause, GetNodeLinkedTo } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import { MethodDescription } from '../../interface/methodprops';

export default async function AddAgentAccessMethods(progresFunc: any) {
	SetPause(true);
	console.log('executing add agent methods');
	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);

	await agentAccesses.forEachAsync(async (agentAccess: Node, mindex: any) => {
		console.log(`${GetNodeTitle(agentAccess)} methods`);
		const graph = GetCurrentGraph();
		let model = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.ModelAccess
		});
		let agent = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.AgentAccess
		});
		if (model && agent) {
			let agentLink = findLink(graph, {
				target: agentAccess.id,
				source: agent.id
			});
			if (agentLink) {
				let methodProps: any = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
				if (methodProps) {
					Object.keys(methodProps).forEach((key: string) => {
						let methodDescription: MethodDescription = methodProps[key];
						if (methodDescription && methodDescription.functionType) {
							let functionType = methodDescription.functionType;
							let methodProperties = MethodFunctions[FunctionTypes[methodDescription.functionType]];
							const functionName = methodProperties.titleTemplate(
								GetNodeTitle(agentAccess),
								GetNodeTitle(agent)
							);
							if (functionType && methodProperties) {
								let httpMethod;
								if (methodProperties.method) {
									switch (methodProperties.method) {
										case Methods.Create:
										case Methods.Update:
											httpMethod = HTTP_METHODS.POST;
											break;
										default:
											httpMethod = HTTP_METHODS.GET;
											break;
									}
									const result = [];

									result.push({
										method: {
											method: CreateAgentFunction({
												nodePackageType: functionName,
												methodType: methodProperties.method,
												model: methodDescription.properties.model
													? GetNodeById(methodDescription.properties.model)
													: model,
												model_output: methodDescription.properties.model_output
													? GetNodeById(methodDescription.properties.model_output)
													: model,
												parentId: methodDescription.properties.parent
													? GetNodeById(methodDescription.properties.parent)
													: null,
												agent,
												httpMethod, //might not be used
												functionType: FunctionTypes[methodDescription.functionType],
												functionName
											})
										},
										methodType: functionType
									});
									executeGraphOperations(result)(GetDispatchFunc(), GetStateFunc());
								} else {
									console.info('no method on function: AddAgentAccessMethods');
								}
							} else {
								console.info('no function type: AddAgentAccessMethods');
							}
						}
					});
					const progress = mindex / agentAccesses.length;
					await progresFunc(progress);
				} else {
					console.info('no method props: AddAgentAccessMethods');
				}
			} else {
				console.info('mode link: AddAgentAccessMethods');
			}
		} else {
			if (!model) {
				console.info('no model: AddAgentAccessMethods');
			}
			if (!agent) {
				console.info('no agent: AddAgentAccessMethods');
			}
		}
	});

	SetPause(false);
	return [];
}