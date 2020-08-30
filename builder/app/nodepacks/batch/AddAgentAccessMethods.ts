import {
	NodesByType,
	GetNodeTitle,
	executeGraphOperations,
	GetDispatchFunc,
	GetStateFunc,
	GetCurrentGraph,
	GetLinkProperty,
	GetNodeById,
	updateComponentProperty,
	GetLink,
	NEW_AFTER_METHOD,
	graphOperation,
	AddLinkBetweenNodes,
	GetNodeProp
} from '../../actions/uiactions';
import {
	NodeTypes,
	LinkType,
	Methods,
	LinkPropertyKeys,
	NodeProperties,
	LinkProperties
} from '../../constants/nodetypes';
import { MethodFunctions, HTTP_METHODS, FunctionTypes } from '../../constants/functiontypes';
import { CreateAgentFunction } from '../../constants/nodepackages';
import { findLink, SetPause, GetNodeLinkedTo, codeTypeWord } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import MethodProps, {
	MethodDescription,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription,
	EffectProps,
	Effect,
	EffectDescription,
	AfterEffect,
	BranchConfig,
	RouteConfig,
	DataChainConfiguration
} from '../../interface/methodprops';
import { check } from 'prettier';

export default async function AddAgentAccessMethods(progresFunc: any) {
	SetPause(true);
	console.log('executing add agent methods');
	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	let collectedMountingDescriptions: MountingDescription[] = [];

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
		let dashboard = GetNodeLinkedTo(graph, {
			id: agentAccess.id,
			link: LinkType.DashboardAccess
		});
		if (model && agent) {
			let agentLink = findLink(graph, {
				target: agentAccess.id,
				source: agent.id
			});
			if (agentLink) {
				// let methodProps: MethodProps = GetLinkProperty(agentLink, LinkPropertyKeys.MethodProps);
				let mountingProps: ViewMoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.MountingProps);
				if (mountingProps) {
					let createMountings: ViewMounting | undefined = mountingProps.Create;
					let getMountings: ViewMounting | undefined = mountingProps.Get;
					let getAllMountings: ViewMounting | undefined = mountingProps.GetAll;
					let updateMountings: ViewMounting | undefined = mountingProps.Update;
					makeViewMountingMethods(createMountings, agentAccess, agent, model, collectedMountingDescriptions);
					makeViewMountingMethods(getMountings, agentAccess, agent, model, collectedMountingDescriptions);
					makeViewMountingMethods(getAllMountings, agentAccess, agent, model, collectedMountingDescriptions);
					makeViewMountingMethods(updateMountings, agentAccess, agent, model, collectedMountingDescriptions);
				} else {
					console.info('no mounting props: AddAgentAccessMethods');
				}

				let effectProps: EffectProps = GetLinkProperty(agentLink, LinkPropertyKeys.EffectProps);
				if (effectProps) {
					let createEffects: Effect | undefined = effectProps.Create;
					let getEffect: Effect | undefined = effectProps.Get;
					let getAllEffect: Effect | undefined = effectProps.GetAll;
					let updateEffect: Effect | undefined = effectProps.Update;
					makeEffectMethods(createEffects, agentAccess, agent, model, collectedMountingDescriptions);
					makeEffectMethods(getEffect, agentAccess, agent, model, collectedMountingDescriptions);
					makeEffectMethods(getAllEffect, agentAccess, agent, model, collectedMountingDescriptions);
					makeEffectMethods(updateEffect, agentAccess, agent, model, collectedMountingDescriptions);
				}
			} else {
				console.info('mode link: AddAgentAccessMethods');
			}
		} else if (agent && dashboard) {
			let agentLink = findLink(graph, {
				target: agentAccess.id,
				source: agent.id
			});
			if (agentLink) {
				let mountingProps: ViewMounting = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardViewMountProps);
				makeViewMountingMethods(mountingProps, agentAccess, agent, dashboard, collectedMountingDescriptions);

				let effectProps: Effect = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardEffectProps);
				makeEffectMethods(effectProps, agentAccess, agent, dashboard, collectedMountingDescriptions);
			} else {
				console.info('agent dashboard link: AddAgentAccessMethods');
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

	collectedMountingDescriptions.forEach((mount: MountingDescription) => {
		SetupAfterEffects(mount, collectedMountingDescriptions);
	});
	SetPause(false);
	return [];
}
function makeViewMountingMethods(
	createMountings: ViewMounting | undefined,
	agentAccess: Node,
	agent: any,
	model: any,
	collectedMountingDescriptions: MountingDescription[]
) {
	if (createMountings && createMountings.mountings) {
		createMountings.mountings.forEach((mounting: MountingDescription) => {
			mounting.methodDescription
				? buildMethodDescriptionFunctions(mounting.methodDescription, agentAccess, agent, model, mounting)
				: null;
			collectedMountingDescriptions.push(mounting);
		});
	}
}

function makeEffectMethods(
	createMountings: Effect | undefined,
	agentAccess: Node,
	agent: any,
	model: any,
	collectedMountingDescriptions: MountingDescription[]
) {
	if (createMountings && createMountings.effects) {
		createMountings.effects.forEach((effect: EffectDescription) => {
			effect.methodDescription
				? buildMethodDescriptionFunctions(effect.methodDescription, agentAccess, agent, model, effect)
				: null;
			collectedMountingDescriptions.push(effect);
		});
	}
}

function buildMethodDescriptionFunctions(
	methodDescription: MethodDescription,
	agentAccess: Node,
	agent: any,
	model: any,
	mounting: MountingDescription
) {
	if (methodDescription && methodDescription.functionType) {
		let functionType = methodDescription.functionType;
		let methodProperties = MethodFunctions[methodDescription.functionType];
		const functionName =
			(mounting ? mounting.name : false) ||
			methodProperties.titleTemplate(GetNodeTitle(model), GetNodeTitle(agent));
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
				let newMethodId: string | null = null;
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
							httpMethod,
							functionType: methodDescription.functionType,
							functionName,
							callback: (newMethod: string) => {
								newMethodId = newMethod;
							}
						})
					},
					methodType: functionType
				});
				executeGraphOperations(result)(GetDispatchFunc(), GetStateFunc());
				if (newMethodId) {
					methodDescription.methodId = newMethodId;
				}
			} else {
				console.info('no method on function: AddAgentAccessMethods');
			}
		} else {
			console.info('no function type: AddAgentAccessMethods');
		}
	}
}
function UpdateLambdaInsertArguments(
	afterEffect: AfterEffect,
	collectedMountingDescriptions: MountingDescription[],
	routes: AfterEffect[]
) {
	if (afterEffect && afterEffect.dataChainOptions && afterEffect.dataChainOptions.checkExistence) {
		let { dataChain } = afterEffect;
		let lambdaInsertArguments = GetNodeProp(dataChain, NodeProperties.LambdaInsertArguments);
		if (lambdaInsertArguments) {
			let { checkExistence } = afterEffect.dataChainOptions;
			updateRouteConfigFromDataChainOptions(
				afterEffect,
				routes,
				collectedMountingDescriptions,
				lambdaInsertArguments
			);
			if (checkExistence && checkExistence.enabled) {
				let { ifFalse, ifTrue } = checkExistence;
				if (ifFalse && ifFalse.enabled) {
					updateBranchMethodDescriptionArgument(
						ifFalse,
						routes,
						collectedMountingDescriptions,
						lambdaInsertArguments
					);
				}
				if (ifTrue && ifTrue.enabled) {
					updateBranchMethodDescriptionArgument(
						ifTrue,
						routes,
						collectedMountingDescriptions,
						lambdaInsertArguments
					);
				}
			}
			updateComponentProperty(dataChain, NodeProperties.LambdaInsertArguments, lambdaInsertArguments);
		}
	}
}
function updateBranchMethodDescriptionArgument(
	branchConfig: BranchConfig,
	routes: AfterEffect[],
	collectedMountingDescriptions: MountingDescription[],
	lambdaInsertArguments: any
) {
	let { routeConfig } = branchConfig.dataChainOptions;

	updateRouteConfig(routeConfig, routes, collectedMountingDescriptions, lambdaInsertArguments);
}
function updateRouteConfigFromDataChainOptions(
	afterEffect: AfterEffect,
	routes: AfterEffect[],
	collectedMountingDescriptions: MountingDescription[],
	lambdaInsertArguments: any
) {
	let { routeConfig } = afterEffect.dataChainOptions;
	if (routeConfig) {
		let temp: RouteConfig = { ...routeConfig, targetId: afterEffect.target };
		updateRouteConfig(temp, routes, collectedMountingDescriptions, lambdaInsertArguments);
	}
}
function updateRouteConfig(
	routeConfig: RouteConfig | undefined,
	routes: AfterEffect[],
	collectedMountingDescriptions: MountingDescription[],
	lambdaInsertArguments: any
) {
	if (routeConfig && routeConfig.pushChange) {
		let { targetId } = routeConfig;
		let route = routes.find((route: AfterEffect) => {
			return route.id === targetId;
		});
		if (route) {
			let description = collectedMountingDescriptions.find((v) => route && v.id == route.target);
			if (description && description.methodDescription) {
				let lambdaKeyName = codeTypeWord(route.name);
				lambdaInsertArguments[lambdaKeyName] = lambdaInsertArguments[lambdaKeyName] || {};
				lambdaInsertArguments[lambdaKeyName].method = description.methodDescription.methodId;
			}
		}
	}
}

function SetupAfterEffects(mounting: MountingDescription, collectedMountingDescriptions: MountingDescription[]) {
	if (mounting && mounting.methodDescription && mounting.methodDescription.methodId) {
		let { methodDescription } = mounting;
		if (mounting && mounting.afterEffects && mounting.afterEffects.length) {
			mounting.afterEffects.forEach((afterEffect: AfterEffect, index: number) => {
				let newAfterEffect: Node;
				if (!afterEffect.dataChainOptions.directExecute) {
					// needs a better way to chain after a previous node.
					// for now all after effect methods need to be direct execute.
					if (mounting.afterEffects[index - 1]) {
						newAfterEffect = createAfterEffect(
							mounting.afterEffects[index - 1].afterEffectNode || '',
							afterEffect.name
						);

						afterEffect.afterEffectNode = newAfterEffect.id;
					} else return;
				} else {
					newAfterEffect = createAfterEffect(methodDescription.methodId);
					afterEffect.afterEffectNode = newAfterEffect.id;
				}
				UpdateLambdaInsertArguments(afterEffect, collectedMountingDescriptions, mounting.afterEffects || []);
				graphOperation(
					AddLinkBetweenNodes(
						newAfterEffect.id,
						afterEffect.dataChain,
						LinkProperties.DataChainAfterEffectConverter
					)
				)(GetDispatchFunc(), GetStateFunc());

				let targetDescription = collectedMountingDescriptions.find(
					(d: MountingDescription) => d.id === afterEffect.target
				);
				if (targetDescription && targetDescription.methodDescription) {
					graphOperation(
						AddLinkBetweenNodes(
							newAfterEffect.id,
							targetDescription.methodDescription.methodId,
							LinkProperties.DataChainAfterEffectConverterTarget
						)
					)(GetDispatchFunc(), GetStateFunc());
				} else {
					throw new Error(
						'missing mounting description for target node: AddAgentAccessMethods.ts(SetupAfterEffects)'
					);
				}
			});
			updateComponentProperty(
				methodDescription.methodId,
				NodeProperties.AfterEffectMethodChain,
				mounting.afterEffects.map((v) => v.afterEffectNode)
			);
		}
	}
}

function createAfterEffect(methodId: string, title?: string): Node {
	let result: any;
	graphOperation(NEW_AFTER_METHOD, {
		parent: methodId,
		groupProperties: {},
		linkProperties: {
			properties: { ...LinkProperties.AfterMethod }
		},
		properties: {
			[NodeProperties.UIText]: title || `${GetNodeTitle(methodId)} After Effect`
		},
		callback: (ne: Node) => {
			result = ne;
		}
	})(GetDispatchFunc(), GetStateFunc());
	return result;
}
