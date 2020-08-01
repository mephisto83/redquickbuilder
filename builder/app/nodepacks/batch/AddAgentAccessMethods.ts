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
	GetLink
} from '../../actions/uiactions';
import { NodeTypes, LinkType, Methods, LinkPropertyKeys, NodeProperties } from '../../constants/nodetypes';
import { MethodFunctions, HTTP_METHODS, FunctionTypes } from '../../constants/functiontypes';
import { CreateAgentFunction } from '../../constants/nodepackages';
import { findLink, SetPause, GetNodeLinkedTo } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import MethodProps, {
	MethodDescription,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription,
	EffectProps,
	Effect,
	EffectDescription
} from '../../interface/methodprops';
import { LinkProperties } from '../../components/titles';

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
					makeViewMountingMethods(createMountings, agentAccess, agent, model);
					makeViewMountingMethods(getMountings, agentAccess, agent, model);
					makeViewMountingMethods(getAllMountings, agentAccess, agent, model);
					makeViewMountingMethods(updateMountings, agentAccess, agent, model);
				} else {
					console.info('no mounting props: AddAgentAccessMethods');
				}

				let effectProps: EffectProps = GetLinkProperty(agentLink, LinkPropertyKeys.EffectProps);
				if (effectProps) {
					let createEffects: Effect | undefined = effectProps.Create;
					let getEffect: Effect | undefined = effectProps.Get;
					let getAllEffect: Effect | undefined = effectProps.GetAll;
					let updateEffect: Effect | undefined = effectProps.Update;
					makeEffectMethods(createEffects, agentAccess, agent, model);
					makeEffectMethods(getEffect, agentAccess, agent, model);
					makeEffectMethods(getAllEffect, agentAccess, agent, model);
					makeEffectMethods(updateEffect, agentAccess, agent, model);
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
				makeViewMountingMethods(mountingProps, agentAccess, agent, dashboard);

				let effectProps: Effect = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardEffectProps);
        makeEffectMethods(effectProps, agentAccess, agent, dashboard);

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

	SetPause(false);
	return [];
}
function makeViewMountingMethods(createMountings: ViewMounting | undefined, agentAccess: Node, agent: any, model: any) {
	if (createMountings && createMountings.mountings) {
		createMountings.mountings.forEach((mounting: MountingDescription) => {
			mounting.methodDescription
				? buildMethodDescriptionFunctions(mounting.methodDescription, agentAccess, agent, model, mounting)
				: null;
		});
	}
}

function makeEffectMethods(createMountings: Effect | undefined, agentAccess: Node, agent: any, model: any) {
	if (createMountings && createMountings.effects) {
		createMountings.effects.forEach((effect: EffectDescription) => {
			effect.methodDescription
				? buildMethodDescriptionFunctions(effect.methodDescription, agentAccess, agent, model, effect)
				: null;
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
