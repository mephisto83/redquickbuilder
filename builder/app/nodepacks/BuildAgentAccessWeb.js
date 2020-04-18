import { NodesByType } from "../methods/graph_methods";
import { NodeTypes } from "../constants/nodetypes";
import { REMOVE_NODE, graphOperation, GetDispatchFunc, GetStateFunc, GetCurrentGraph } from "../actions/uiactions";
import AddAgentAccess from "./AddAgentAccess";

export default function BuildAgentAccessWeb(args) {
  const { agents, models, agentAccess } = args;

  const graph = GetCurrentGraph();

  const agentAccesss = NodesByType(graph, NodeTypes.AgentAccessDescription);
  const result = [...agentAccesss.map(v => ({
    operation: REMOVE_NODE,
    options() {
      return {
        id: v.id
      }
    }
  }))];
  models.forEach((model, modelIndex) => {
    agents.forEach((agent, agentIndex) => {
      if (agentAccess && agentAccess[agentIndex] && agentAccess[agentIndex][modelIndex]) {
        const values = agentAccess[agentIndex][modelIndex];
        if (values) {
          result.push(...AddAgentAccess({
            modelId: model,
            agentId: agent,
            linkProps: { ...values }
          }))
        }
      }
    })
  })


  graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
