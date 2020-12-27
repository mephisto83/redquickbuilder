import {
	GetNodeByProperties,
	GetNodesByProperties,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetScreenOptions,
	GetCurrentGraph
} from '../../actions/uiActions';
import { LinkType, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { AuthorizedDashboard, SelectTargetScreen } from '../../components/titles';
import AddChainToNavigateNextScreen from './AddChainToNavigateNextScreen';
import { GetNodesLinkedTo } from '../../methods/graph_methods';
import HomeViewGetWindowSettings from '../HomeViewGetWindowSettings'
import { Node } from '../../methods/graph_types';
export default async function LoadWindowSettings(progresFunc: any) {
	const screen =
		GetNodeByProperties({
			[NodeProperties.IsHomeLaunchView]: true,
			[NodeProperties.NODEType]: NodeTypes.Screen
		}) ||
		GetNodeByProperties({
			[NodeProperties.UIText]: AuthorizedDashboard,
			[NodeProperties.NODEType]: NodeTypes.Screen
		});

	const dataChains = GetNodesByProperties({
		[NodeProperties.UIText]: SelectTargetScreen,
		[NodeProperties.NODEType]: NodeTypes.DataChain
	});
	if (!screen) {
		throw new Error('no screen found');
	}
	if (!dataChains) {
		throw new Error('No Target Screen Data chains found');
	}
	let screenOptions = GetNodesLinkedTo(GetCurrentGraph(), {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let result: any[] = [];
	screenOptions.forEach(async (screenOption: Node) => {
		result.push(HomeViewGetWindowSettings({ component: screenOption.id }));
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	
	
	return [];
}
