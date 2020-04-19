import { NodesByType, GetNodeProp, GetNodeTitle, executeGraphOperations, GetDispatchFunc, GetStateFunc, GetNodeByProperties, GetNodesByProperties, GetCurrentGraph, GetLinkProperty, isAccessNode } from "../../actions/uiactions";
import { NodeTypes, NodeProperties, LinkType, Methods } from "../../constants/nodetypes";
import { FunctionTypes, MethodFunctions, HTTP_METHODS } from "../../constants/functiontypes";
import { CreateAgentFunction } from "../../constants/nodepackages";
import { existsLinksBetween, findLink, existsLinkBetween } from "../../methods/graph_methods";

export default async function AddAgentMethods(progresFunc) {

  const agents = GetNodesByProperties({
    [NodeProperties.NODEType]: NodeTypes.Model,
    [NodeProperties.IsAgent]: v => v === 'true' || v === true,
    [NodeProperties.UIText]: v => v !== 'User'
  });//  NodesByType(null, NodeTypes.Model).filter(x => GetNodeProp(x, NodeProperties.IsAgent)).filter(x => GetNodeTitle(x) !== 'User');
  const models = NodesByType(null, NodeTypes.Model).filter(x => !GetNodeProp(x, NodeProperties.IsAgent));
  const functionTypes = [
    FunctionTypes.Create_Object__Object,
    FunctionTypes.Get_Objects_From_List_Of_Ids,
    FunctionTypes.Update_Object_Agent_Value__Object,
    FunctionTypes.Get_Agent_Value__IListObject,
    FunctionTypes.Get_Object_Agent_Value__Object
  ];
  const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);

  await agents.forEachAsync(async (agent, aindex) => {
    await models.forEachAsync(async (model, mindex) => {
      const graph = GetCurrentGraph();
      const agentAcesses = agentAccesses.find(aa => isAccessNode(agent, model, aa, graph));
      if (agentAcesses) {
        const agentCreds = findLink(graph, { target: agentAcesses.id, source: agent.id });
        await functionTypes.forEachAsync(async (functionType, findex) => {
          const start = Date.now();
          const functionName = MethodFunctions[functionType].titleTemplate(GetNodeTitle(model), GetNodeTitle(agent));
          const result = [];

          if (GetLinkProperty(agentCreds, MethodFunctions[functionType].method)) {
            let httpMethod;
            switch (MethodFunctions[functionType].method) {
              case Methods.Create:
              case Methods.Update:
                httpMethod = HTTP_METHODS.POST;
                break;
              default:
                httpMethod = HTTP_METHODS.GET;
                break;
            }
            result.push({
              method: {
                method: CreateAgentFunction({
                  nodePackageType: functionName,
                  methodType: MethodFunctions[functionType].method,
                  model,
                  agent,
                  httpMethod, //might not be used
                  functionType,
                  functionName
                })
              },
              methodType: functionType
            });
            executeGraphOperations(result)(GetDispatchFunc(), GetStateFunc());
          }
          const progress = ((aindex * models.length * functionTypes.length) + mindex * functionTypes.length + findex) / (agents.length * models.length * functionTypes.length);
          await progresFunc(progress)
        });
      }
    });
  });


  return [];
}
