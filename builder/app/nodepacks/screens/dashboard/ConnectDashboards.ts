import { NodeTypes, NodeProperties, UITypes, LinkType } from '../../../constants/nodetypes';
import {
	NodesByType,
	GetNodeProp,
	GetNodeTitle,
	GetCurrentGraph,
	addComponentEventTo,
	ComponentEventTo,
	ADD_NEW_NODE,
	addInstanceFunc,
	GetNodeById,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc
} from '../../../actions/uiactions';
import { Node, Graph } from '../../../methods/graph_types';
import CreateSmartDashboard, { ButtonDescription } from './CreateSmartDashboard';
import { GetNodesLinkedTo, SOURCE, SetPause, GetNodeLinkedTo } from '../../../methods/graph_methods';
import ConnectLifecycleMethod from '../../../components/ConnectLifecycleMethod';

export default function ConnectDashboards(
	filter: Function,
	types = {
		[UITypes.ElectronIO]: true,
		[UITypes.ReactNative]: true,
		[UITypes.ReactWeb]: true
	}
) {
	let screens = NodesByType(null, NodeTypes.Screen)
		.filter(filter);
	let graph = GetCurrentGraph();
	SetPause(true);
	let result: any = [];
	screens.forEach((screen: Node) => {
		let screenOptions = GetNodesLinkedTo(graph, {
			id: screen.id,
			componentType: NodeTypes.ScreenOption
		});
		screenOptions.forEach((screenOption: Node) => {
			let button: ButtonDescription[] = GetNodeProp(screenOption, NodeProperties.DashboardButtons) || [];
			let clickEvent = 'onClick';
			switch (GetNodeProp(screenOption, NodeProperties.ViewType)) {
				case UITypes.ReactNative:
					clickEvent = 'onPress';
					break;
			}
			button.forEach((btn: ButtonDescription) => {
				let clickHandle: Node;
				let handleInstance: Node;
				result.push(
					ComponentEventTo(btn.id, clickEvent, (newnode: Node) => {
						clickHandle = newnode;
					})
				);
				result.push(function() {
					return {
						operation: ADD_NEW_NODE,
						options: addInstanceFunc(clickHandle, (newnode: Node) => {
							handleInstance = newnode;
						})
					};
				});
				result.push(function(graph: Graph) {
					let target = GetNodeProp(btn.id, NodeProperties.Target);
					if (!target) {
						throw new Error('Button needs to have target set');
					}
					let navScreenTarget = GetNodeById(target);
					let screenTarget = GetNodeProp(navScreenTarget, NodeProperties.Screen);
					return ConnectLifecycleMethod({ target: screenTarget.id, source: handleInstance.id, graph });
				});
			});
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	SetPause(false);
}
