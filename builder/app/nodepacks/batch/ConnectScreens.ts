import {
	NodesByType,
	GetNodeProp,
	GetMethodNodeProp,
	GetStateFunc,
	GetDispatchFunc,
	graphOperation,
	ScreenOptionFilter,
	GetLinkProperty,
	GetCurrentGraph,
	GetNodeByProperties,
	GetMethodProps,
  GetNodesByProperties
} from '../../actions/uiactions';
import { NodeTypes, NodeProperties, LinkType, LinkPropertyKeys } from '../../constants/nodetypes';
import { MethodFunctions, FunctionTemplateKeys, FunctionTypes } from '../../constants/functiontypes';
import { ViewTypes } from '../../constants/viewtypes';
import ScreenConnectGet from '../screens/ScreenConnectGet';
import ScreenConnectGetAll from '../screens/ScreenConnectGetAll';
import ScreenConnectCreate from '../screens/ScreenConnectCreate';
import ScreenConnectUpdate from '../screens/ScreenConnectUpdate';
import { Node } from '../../methods/graph_types';
import { GetNodeLinkedTo, findLink } from '../../methods/graph_methods';
import { MethodDescription } from '../../interface/methodprops';

export default async function ConnectScreens(progresFunc: any, filter?: any) {
	const allscreens = NodesByType(null, NodeTypes.Screen);
	const screens = allscreens.filter(ScreenOptionFilter);
	await screens
		.filter((screen: any) => (filter ? filter(screen) : true))
		.forEachAsync(async (screen: any, index: any, total: any) => {
			const viewType = GetNodeProp(screen, NodeProperties.ViewType);

			const methods = GetPossibleMethods(screen);

			const navigateToScreens = GetPossibleNavigateScreens(screen, allscreens);

			const componentsDidMounts = GetPossibleComponentDidMount(screen);

			if (methods.length) {
				let commands = [];
				switch (viewType) {
					case ViewTypes.Get:
						commands = ScreenConnectGet({
							method: methods[0].id,
							node: screen.id,
							navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
						});
						break;
					case ViewTypes.GetAll:
						commands = ScreenConnectGetAll({
							method: methods[0].id,
							node: screen.id,
							navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
						});
						break;
					case ViewTypes.Create:
						commands = ScreenConnectCreate({
							method: methods[0].id,
							node: screen.id
						});
						break;
					case ViewTypes.Update:
						commands = ScreenConnectUpdate({
							method: methods[0].id,
							componentDidMountMethods: componentsDidMounts.map((x: any) => x.id),
							node: screen.id
						});
						break;
					default:
						break;
				}

				graphOperation([ ...commands ])(GetDispatchFunc(), GetStateFunc());
			}
			await progresFunc(index / total);
		});
}

export function GetPossibleNavigateScreens(screen: any, allscreens: any) {
	const screens = allscreens || NodesByType(null, NodeTypes.Screen);
	const viewType = GetNodeProp(screen, NodeProperties.ViewType);
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	const agentId = GetNodeProp(screen, NodeProperties.Agent);

	return screens
		.filter((x: { id: any }) => x.id !== screen.id)
		.filter((x: any) => {
			if (viewType === ViewTypes.Get) {
				return GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update;
			}
			return GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Get;
		})
		.filter((x: any) => {
			if (screenModel) {
				const agent = GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
				return agent === agentId;
			}
			return false;
		})
		.filter((x: any) => {
			if (screenModel) {
				const modelOutput = GetNodeProp(x, NodeProperties.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}

export function GetPossibleComponentDidMount(screen: any) {
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	return NodesByType(null, NodeTypes.Method)
		.filter(
			(x: any) => (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === ViewTypes.Get
		)
		.filter((x: string | Node) => {
			if (screenModel) {
				const modelOutput =
					GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
					GetMethodNodeProp(x, FunctionTemplateKeys.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}
export function GetAccessAgentPreferredMethods(screen: any, agentId: string, screenModel: string, viewType: string) {
	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	const graph = GetCurrentGraph();
	let result: Node[] = [];
	agentAccesses.filter((agentAccess: Node, mindex: any) => {
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
					let methodDescription: MethodDescription = methodProps[viewType];
					if (methodDescription) {
						methodDescription.functionType;
						let functionType = FunctionTypes[methodDescription.functionType];
						if (functionType) {
							result.push(
								...GetNodesByProperties({
									[NodeProperties.FunctionType]: functionType,
									[NodeProperties.NODEType]: NodeTypes.Method
								}).filter((methodNode: Node) => {
									let methodProps = GetMethodProps(methodNode);
									return (
										methodProps[FunctionTemplateKeys.Model] === model.id &&
										methodProps[FunctionTemplateKeys.Agent] === agent.id
									);
								})
							);
						}
					}
				}
			}
		}
	});

	return result;
}
export function GetPossibleMethods(screen: any) {
	const viewType = GetNodeProp(screen, NodeProperties.ViewType);
	const screenModel = GetNodeProp(screen, NodeProperties.Model);
	const agentId = GetNodeProp(screen, NodeProperties.Agent);

	let preferredMethods = GetAccessAgentPreferredMethods(screen, agentId, screenModel, viewType);
	if (preferredMethods && preferredMethods.length) {
		return preferredMethods;
	}
	return NodesByType(null, NodeTypes.Method)
		.filter((x: string | Node) => {
			if (screenModel) {
				const agent = GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
				return agent === agentId;
			}
			return false;
		})
		.filter((x: any) => {
			const functionType = MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {};
			return functionType.method === viewType && !functionType.isFetchCompatible;
		})
		.filter((x: string | Node) => {
			if (screenModel) {
				const modelOutput =
					GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
					GetMethodNodeProp(x, FunctionTemplateKeys.Model);
				return modelOutput === screenModel;
			}
			return true;
		});
}
