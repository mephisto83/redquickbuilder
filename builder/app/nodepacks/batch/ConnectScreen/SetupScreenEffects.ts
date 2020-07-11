import { ScreenEffectApi, ScreenEffectApiProps } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import { Node } from '../../../methods/graph_types';
import { GetNodesLinkedTo } from '../../../methods/graph_methods';
import { GetCurrentGraph } from '../../../actions/uiactions';
import { LinkType } from '../../../constants/nodetypes';

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
