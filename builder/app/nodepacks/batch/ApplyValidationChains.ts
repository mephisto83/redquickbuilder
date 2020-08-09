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
} from '../../actions/uiactions';
import { Node, GraphLink } from '../../methods/graph_types';
import { LinkPropertyKeys, LinkType, NodeProperties, LinkProperties } from '../../constants/nodetypes';
import {
	EffectProps,
	Effect,
	PermissionConfig,
	ViewMoutingProps,
	MountingDescription,
	ViewMounting,
  ValidationConfig} from '../../interface/methodprops';

export default function ApplyValidationChains() {
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
      effectDescription.validations &&
			effectDescription.methodDescription &&
			effectDescription.methodDescription.methodId
		) {
			let { methodId } = effectDescription.methodDescription;
			effectDescription.validations.forEach((validation: ValidationConfig) => {
				if (validation.dataChain) {
					let graph = GetCurrentGraph();
					let validatorNode = GetNodeLinkedTo(graph, {
						id: methodId,
						componentType: NodeTypes.Validator
					});
					let validationDataChain: any;
					graphOperation(
						CreateNewNode(
							{
								[NodeProperties.NODEType]: NodeTypes.ValidationDataChain,
								[NodeProperties.UIText]: validation.name,
								[NodeProperties.GroupParent]: GetNodeProp(validatorNode, NodeProperties.GroupParent)
							},
							(node: Node) => {
								validationDataChain = node;
							}
						)
					)(GetDispatchFunc(), GetStateFunc());
					if (validationDataChain) {

            graphOperation(
							AddLinkBetweenNodes(validatorNode.id, validationDataChain.id, LinkProperties.ValidationDataChain)
            )(GetDispatchFunc(), GetStateFunc());

            graphOperation(
							AddLinkBetweenNodes(validationDataChain.id, validation.dataChain, LinkProperties.DataChainLink)
						)(GetDispatchFunc(), GetStateFunc());

          }
				}
			});
		}
	};
}
