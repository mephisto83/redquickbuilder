import { Node, Graph } from '../../methods/graph_types';
import { NodesByType, GetNodesLinkedTo, GetNodeLinkedTo } from '../../methods/graph_methods';
import {
	GetCurrentGraph,
	NodeTypes,
	GetNodeTitle,
	AddLinkBetweenNodes,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation,
	GetJSCodeName,
	updateComponentProperty
} from '../../actions/uiActions';
import { AddInternalComponentApi, SetupApiToBottom } from './ConnectScreen/Shared';
import { LinkProperties, NodeProperties } from '../../constants/nodetypes';

export default function AddDefaultAgentExistsDatachains(screen: Node) {
	let graph: Graph = GetCurrentGraph();
	let userOfAgentTypes = NodesByType(graph, NodeTypes.UserOfAgentType);
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		componentType: NodeTypes.ScreenOption
	});
	screenOptions.forEach((screenOption: Node) => {
		userOfAgentTypes.forEach((userOfAgentType: Node) => {
			let dataChain: Node = GetNodeLinkedTo(graph, {
				id: userOfAgentType.id,
				componentType: NodeTypes.DataChain
			});
			let model: Node = GetNodeLinkedTo(graph, {
				id: userOfAgentType.id,
				componentType: NodeTypes.Model
			});
			if (dataChain) {
				let apiName = GetJSCodeName(dataChain);
				let internalComponent = AddInternalComponentApi(screenOption.id, apiName);
				let setupResult = SetupApiToBottom(screenOption, apiName, [], true);
				// The internal component's intention is to hold the value for if the current user is of an "agent" type.
				/**
         * If the agent is a ManagerAgent, then the this.state.$isManagerAgent should be true, if the output of the DC.IsManagerAgent(...) returns
         * true.
         */
				[ ...setupResult.internal, internalComponent ].unique().map((internalApi: string) => {
					updateComponentProperty(internalApi, NodeProperties.UserOfAgent, true);
					updateComponentProperty(internalApi, NodeProperties.Model, model.id);
        });

				graphOperation(
					AddLinkBetweenNodes(internalComponent, dataChain.id, LinkProperties.DataChainScreenEffect)
				)(GetDispatchFunc(), GetStateFunc());
			}
		});
	});
}
