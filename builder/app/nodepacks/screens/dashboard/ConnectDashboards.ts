/* eslint-disable default-case */
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
	GetStateFunc,
	GetNodeByProperties
} from '../../../actions/uiActions';
import { Node, Graph } from '../../../methods/graph_types';
import { ButtonDescription } from './CreateSmartDashboard';
import { GetNodesLinkedTo, SOURCE, SetPause, GetNodeLinkedTo } from '../../../methods/graph_methods';
import ConnectLifecycleMethod from '../../../components/ConnectLifecycleMethod';
import { AddComponentAutoStyles } from '../../batch/ConnectScreen/Shared';

export default function ConnectDashboards(
	filter: Function,
	onProgress: any,
	types = {
		[UITypes.ElectronIO]: true,
		[UITypes.ReactNative]: true,
		[UITypes.ReactWeb]: true
	}
) {
	const screens: Node[] = NodesByType(null, NodeTypes.Screen).filter(filter);
	const graph: Graph = GetCurrentGraph();
	SetPause(true);
	const result: any = [];
	const total = screens.length;
	screens.forEach((screen: Node, sindex: number) => {
		const screenOptions = GetNodesLinkedTo(graph, {
			id: screen.id,
			componentType: NodeTypes.ScreenOption
		});
		screenOptions.forEach((screenOption: Node) => {
			if (onProgress) {
				onProgress(sindex / total);
			}
			const buttons: ButtonDescription[] = GetNodeProp(screenOption, NodeProperties.DashboardButtons) || [];
			const viewComponent: string = GetNodeProp(screenOption, NodeProperties.DashboardViewComponent);
			let clickEvent = 'onClick';
			switch (GetNodeProp(screenOption, NodeProperties.ViewType)) {
				case UITypes.ReactNative:
					clickEvent = 'onPress';
					break;
			}
			buttons.forEach((btn: ButtonDescription) => {
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
					const target = GetNodeProp(btn.id, NodeProperties.Target);
					if (!target) {
						throw new Error('Button needs to have target set');
					}
					const navScreenTarget = GetNodeById(target);
					let screenTarget = GetNodeProp(navScreenTarget, NodeProperties.Screen);
					if (!screenTarget) {
						if (btn.isDashboard) {
							screenTarget = GetNodeLinkedTo(null, {
								id: navScreenTarget.id,
								link: LinkType.NavigationScreenImplementation
							});
						} else {
							screenTarget = GetNodeByProperties({
								[NodeProperties.NODEType]: NodeTypes.Screen,
								[NodeProperties.Agent]: GetNodeProp(navScreenTarget, NodeProperties.Agent),
								[NodeProperties.Model]: GetNodeProp(navScreenTarget, NodeProperties.Model),
								...btn.isDashboard
									? { [NodeProperties.IsDashboard]: true }
									: {
											[NodeProperties.ViewType]: GetNodeProp(
												navScreenTarget,
												NodeProperties.ViewType
											)
										}
							});
						}
					}
					if (screenTarget) {
						return ConnectLifecycleMethod({
							target: screenTarget.id,
							source: handleInstance.id,
							graph
						});
					}
					console.warn('didnt find a screen');
					return null;
				});
			});
			AddStylesToScreenOptionButtons(buttons, viewComponent);
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	SetPause(false);
}
function AddStylesToScreenOptionButtons(buttons: ButtonDescription[], viewComponent: string) {
  let layout: any;
  buttons.forEach((button: ButtonDescription, index: number) => {
    if (button.id && button.buttonId) {
      layout = GetNodeProp(viewComponent, NodeProperties.Layout); // SetLayoutComponent(GetNodeById(viewComponent, graph), button.buttonId, button.id);
      let targetScreenAgent: string = GetNodeProp(button.target, NodeProperties.Agent);
      if (targetScreenAgent)
        AddComponentAutoStyles(viewComponent, { agent: targetScreenAgent }, button.buttonId);
    }
    else {
      throw new Error('button no found, in create smart dashboard');
    }
  });
}

