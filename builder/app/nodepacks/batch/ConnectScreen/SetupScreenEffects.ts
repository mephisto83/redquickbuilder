import { ScreenEffectApi, ScreenEffectApiProps } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import { Node } from '../../../methods/graph_types';
import { GetNodesLinkedTo } from '../../../methods/graph_methods';
import {
	GetCurrentGraph,
	GetJSCodeName,
	AddLinkBetweenNodes,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation
} from '../../../actions/uiActions';
import { LinkType, LinkProperties } from '../../../constants/nodetypes';
import { AddInternalComponentApi, SetupApiToBottom } from './Shared';

export default function SetupScreenEffects(
	screen: Node,
	screenEffects: ScreenEffectApi[],
	information: SetupInformation
) {
	let screenOptions = GetNodesLinkedTo(GetCurrentGraph(), {
		id: screen.id,
		link: LinkType.ScreenOptions
	});

	screenOptions.forEach((screenOption: Node) => {
		SetupScreenOptionEffects(screenOption, screen, screenEffects, information);
	});
}
function SetupScreenOptionEffects(
	screenOption: Node,
	screen: Node,
	screenEffects: ScreenEffectApi[],
	information: SetupInformation
) {
	screenEffects
		.filter((screenEffect: ScreenEffectApi) => screenEffect.name)
		.forEach((screenEffect: ScreenEffectApi) => {
			let internalComponent = AddInternalComponentApi(screenOption.id, screenEffect.name.toJavascriptName());
			if (screenEffect.passDeep) {
				SetupApiToBottom(screenOption, GetJSCodeName(internalComponent), [], true);
			}
			graphOperation(
				AddLinkBetweenNodes(internalComponent, screenEffect.dataChain, LinkProperties.DataChainScreenEffect)
			)(GetDispatchFunc(), GetStateFunc());
		});
}
export function GetScreenEffectApi(
	screenEffectApiProps: ScreenEffectApiProps,
	viewType: string
): ScreenEffectApi[] | null {
	let temp: any = screenEffectApiProps;

	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
}
