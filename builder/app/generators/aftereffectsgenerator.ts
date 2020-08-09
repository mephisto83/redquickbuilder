import { NodesByType, getNodeLinks, GetNodeLinkedTo, codeTypeWord } from '../methods/graph_methods';
import {
	GetCurrentGraph,
	GetLinkProperty,
	graphOperation,
	CreateNewNode,
	GetDispatchFunc,
	GetCodeName
} from '../actions/uiactions';
import { NodeTypes, LinkPropertyKeys, LinkType, NEW_LINE } from '../constants/nodetypes';
import { GraphLink, Node } from '../methods/graph_types';
import {
	EffectProps,
	Effect,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription,
	ValidationConfig,
	AfterEffect
} from '../interface/methodprops';

export default function AfterEffectsGenerator() {
	let graph = GetCurrentGraph();
	let agentAccessDescriptionNodes = NodesByType(graph, NodeTypes.AgentAccessDescription);
	let result: string[] = [];
	agentAccessDescriptionNodes.forEach((agentAccessDescriptionNode: Node) => {
		let agentLinks = getNodeLinks(graph, agentAccessDescriptionNode.id).filter((link: GraphLink) => {
			return GetLinkProperty(link, LinkPropertyKeys.TYPE) === LinkType.AgentAccess;
		});

		agentLinks.forEach((agentLink: GraphLink) => {
			let effectProps: EffectProps = GetLinkProperty(agentLink, LinkPropertyKeys.EffectProps);
			if (effectProps) {
				if (effectProps.Create) {
					result.push(HandleEffect(effectProps.Create));
				}
				if (effectProps.Get) {
					result.push(HandleEffect(effectProps.Get));
				}
				if (effectProps.GetAll) {
					result.push(HandleEffect(effectProps.GetAll));
				}
				if (effectProps.Update) {
					result.push(HandleEffect(effectProps.Update));
				}
			}
			let dashboardEffect: Effect = GetLinkProperty(agentLink, LinkPropertyKeys.DashboardEffectProps);
			if (dashboardEffect && dashboardEffect.effects) {
				result.push(HandleEffect(dashboardEffect));
			}

			let viewMountProps: ViewMoutingProps = GetLinkProperty(agentLink, LinkPropertyKeys.MountingProps);
			if (viewMountProps) {
				if (viewMountProps.Create) {
					result.push(HandleViewMounting(viewMountProps.Create));
				}
				if (viewMountProps.Get) {
					result.push(HandleViewMounting(viewMountProps.Get));
				}
				if (viewMountProps.GetAll) {
					result.push(HandleViewMounting(viewMountProps.GetAll));
				}
				if (viewMountProps.Update) {
					result.push(HandleViewMounting(viewMountProps.Update));
				}
			}
			let dashboardViewMountProps: ViewMounting = GetLinkProperty(
				agentLink,
				LinkPropertyKeys.DashboardViewMountProps
			);
			if (dashboardViewMountProps) {
				result.push(HandleViewMounting(dashboardViewMountProps));
			}
		});
	});

	return `public class AfterEffectChains  {
    ${result.filter((x) => x).join(NEW_LINE)}
  }`;
}

function HandleViewMounting(viewMounting: ViewMounting): string {
	if (viewMounting && viewMounting.mountings) {
		return viewMounting.mountings.map(HandleDescription()).filter((x: string) => !!x).join(NEW_LINE);
	}
	return '';
}

function HandleEffect(effect: Effect): string {
	if (effect && effect.effects) {
		return effect.effects.map(HandleDescription()).filter((x: string) => x).join(NEW_LINE);
	}
	return '';
}

function HandleDescription(): (value: MountingDescription, index: number, array: MountingDescription[]) => string {
	return (effectDescription: MountingDescription) => {
		if (effectDescription.methodDescription && effectDescription.methodDescription.methodId) {
			if (effectDescription && effectDescription.afterEffects && effectDescription.afterEffects.length) {
				let name = GetCodeName(effectDescription.methodDescription.methodId);
				let guts = effectDescription.afterEffects
					.map((afterEffect: AfterEffect) => {
						return `public const string ${codeTypeWord(afterEffect.name)} = "[${name}] ${codeTypeWord(
							afterEffect.name
						)}";`;
					})
					.join(NEW_LINE);

				return `public class ${name} {
          ${guts}
        }`;
			}
		}
		return '';
	};
}
