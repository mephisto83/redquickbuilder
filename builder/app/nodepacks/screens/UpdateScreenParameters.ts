import { convertToURLRoute, GetNodeProp, findLink, GetNodesLinkedTo } from '../../methods/graph_methods';
import { NodeTypes, NodeProperties, LinkPropertyKeys, LinkType } from '../../constants/nodetypes';
import {
	UPDATE_NODE_PROPERTY,
	GetNodeTitle,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	NodesByType,
	GetScreenUrl,
	getAccessScreen,
	GetNodeById,
	GetLinkProperty,
	GetCurrentGraph,
	$addComponentApiNodes
} from '../../actions/uiActions';
import { Node } from '../../methods/graph_types';
import { MethodDescription } from '../../interface/methodprops';
import { FunctionTypes, MethodFunctions } from '../../constants/functiontypes';

export default async function UpdateScreenParameters(args: any = {}) {
	let screens = NodesByType(null, NodeTypes.Screen);

	let graph = GetCurrentGraph();
	const result: any[] = [];
	const accesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	screens.filter((x: any) => !GetNodeProp(x, NodeProperties.IsHomeView)).map((screen: Node) => {
		let access = accesses.find(getAccessScreen(screen));
		if (!access) {
			console.info('no access : UpdateScreenParameters');
			return;
		}
		let agent = GetNodeById(GetNodeProp(screen, NodeProperties.Agent));
		if (!agent) {
			console.info('no agent: UpdateScreenParameters');
			return;
		}
		let viewType = GetNodeProp(screen, NodeProperties.ViewType);
		let link = findLink(graph, {
			target: access.id,
			source: agent.id
		});
		if (link) {
			let methodProps: any = GetLinkProperty(link, LinkPropertyKeys.MethodProps);
			if (methodProps) {
				let methodDescription: MethodDescription = methodProps[viewType];
				if (methodDescription) {
					let functionType = FunctionTypes[methodDescription.functionType];
					if (functionType) {
						let methodFunction = MethodFunctions[functionType];
						if (methodFunction && methodFunction.parameters) {
							let { parameters } = methodFunction.parameters;
							if (parameters) {
								let { template } = parameters;
								if (template) {
									Object.keys(template).map((parameterKey) => {
										console.info(`adding ${parameterKey} to api if it doesn't exist.`);
										let externalApis = GetNodesLinkedTo(graph, {
											id: screen.id,
											link: LinkType.ComponentExternalApi
										});
										console.info(`found ${externalApis.length} external apis for screen`);
										let externalApi = externalApis.find((externalApi: Node) => {
											return parameterKey == GetNodeTitle(externalApi);
										});
										if (!externalApi) {
											result.push(
												...$addComponentApiNodes(
													screen.id,
													parameterKey,
													null,
													null,
													(args: { externalApi: string }) => {
														externalApi = args.externalApi;
													}
												),
												() => {
													return {
														operation: UPDATE_NODE_PROPERTY,
														options() {
															return {
																id: externalApi,
																properties: {
																	[NodeProperties.IsUrlParameter]: true
																}
															};
														}
													};
												}
											);
										} else {
											console.info(`${parameterKey} already is a parameter on the screen`);
										}
									});
								} else {
									console.info('no template in paramters: UpdateScreenParameters');
								}
							} else {
								console.info('no parameters: UpdateScreenParameters');
							}
						} else {
							console.info('no method function with parameters: UpdateScreenParameters');
						}
					} else {
						console.info('no function type: UpdateScreenParameters');
					}
				} else {
					console.info('no method description: UpdateScreenParameters');
				}
			} else {
				console.info('no method props: UpdateScreenParameters');
			}
		}
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
