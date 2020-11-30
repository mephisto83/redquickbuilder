import { NodesByType, getNodeLinks, GetNodeLinkedTo, GetNodeProp } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	NodeTypes,
	GetLinkProperty,
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	AddLinkBetweenNodes
} from '../../actions/uiActions';
import { Node, GraphLink } from '../../methods/graph_types';
import { LinkPropertyKeys, LinkType, NodeProperties, LinkProperties } from '../../constants/nodetypes';
import {
	EffectProps,
	Effect,
	PermissionConfig,
	ViewMoutingProps,
	MountingDescription,
	ViewMounting,
	ValidationConfig,
	ExecutionConfig
} from '../../interface/methodprops';

export default function ApplyExecutionChains() {
	let graph = GetCurrentGraph();
	let agentAccessDescriptionNodes = NodesByType(graph, NodeTypes.AgentAccessDescription);

	agentAccessDescriptionNodes.forEach((agentAccessDescriptionNode: Node) => {
		let agentLinks = getNodeLinks(graph, agentAccessDescriptionNode.id).filter((link: GraphLink) => {
			return GetLinkProperty(link, LinkPropertyKeys.TYPE) === LinkType.AgentAccess;
		});

		agentLinks.forEach((agentLink: GraphLink) => {
			let effectProps: EffectProps = GetLinkProperty(agentLink, LinkPropertyKeys.EffectProps);
			if (effectProps) {
				if (effectProps.Create) {
					HandleEffect(effectProps.Create);
				}
				if (effectProps.Get) {
					HandleEffect(effectProps.Get);
				}
				if (effectProps.GetAll) {
					HandleEffect(effectProps.GetAll);
				}
				if (effectProps.Update) {
					HandleEffect(effectProps.Update);
				}
			}
			let dashboardEffect: Effect = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardEffectProps);
			if (dashboardEffect && dashboardEffect.effects) {
				HandleEffect(dashboardEffect);
			}

			let viewMountProps: ViewMoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.MountingProps);
			if (viewMountProps) {
				if (viewMountProps.Create) {
					HandleViewMounting(viewMountProps.Create);
				}
				if (viewMountProps.Get) {
					HandleViewMounting(viewMountProps.Get);
				}
				if (viewMountProps.GetAll) {
					HandleViewMounting(viewMountProps.GetAll);
				}
				if (viewMountProps.Update) {
					HandleViewMounting(viewMountProps.Update);
				}
			}
			let dashboardViewMountProps: ViewMounting = GetLinkProperty(
				agentLink,
				LinkPropertyKeys.DashboardViewMountProps
			);
			if (dashboardViewMountProps) {
				HandleViewMounting(dashboardViewMountProps);
			}
		});
	});
}

function HandleViewMounting(viewMounting: ViewMounting) {
	if (viewMounting && viewMounting.mountings) {
		viewMounting.mountings.forEach(HandleDescription());
	}
}

function HandleEffect(effect: Effect) {
	if (effect && effect.effects) {
		effect.effects.forEach(HandleDescription());
	}
}

function HandleDescription(): (value: MountingDescription, index: number, array: MountingDescription[]) => void {
	return (effectDescription: MountingDescription) => {
		if (
			effectDescription &&
			effectDescription.executions &&
			effectDescription.methodDescription &&
			effectDescription.methodDescription.methodId
		) {
			let { methodId } = effectDescription.methodDescription;
			effectDescription.executions.forEach((execution: ExecutionConfig) => {
				if (execution.dataChain) {
					let graph = GetCurrentGraph();
					let executorNode = GetNodeLinkedTo(graph, {
						id: methodId,
						componentType: NodeTypes.Executor
					});
					let executionDatahain: any;
					graphOperation(
						CreateNewNode(
							{
								[NodeProperties.NODEType]: NodeTypes.ExecutionDataChain,
								[NodeProperties.UIText]: execution.name,
								[NodeProperties.GroupParent]: GetNodeProp(executorNode, NodeProperties.GroupParent)
							},
							(node: Node) => {
								executionDatahain = node;
							}
						)
					)(GetDispatchFunc(), GetStateFunc());
					if (executionDatahain) {
						graphOperation(
							AddLinkBetweenNodes(
								executorNode.id,
								executionDatahain.id,
								LinkProperties.ExecutionDataChain
							)
						)(GetDispatchFunc(), GetStateFunc());

						graphOperation(
							AddLinkBetweenNodes(
								executionDatahain.id,
								execution.dataChain,
								LinkProperties.DataChainLink
							)
						)(GetDispatchFunc(), GetStateFunc());
					}
				}
			});
		}
	};
}
