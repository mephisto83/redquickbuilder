import { NodesByType, GetNodeProp, GetNodeTitle, executeGraphOperations, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import { FunctionTypes, MethodFunctions, HTTP_METHODS } from "../../constants/functiontypes";
import { CreateAgentFunction } from "../../constants/nodepackages";

export default async function AddAgentMethods(progresFunc) {

  const agents = NodesByType(null, NodeTypes.Model).filter(x => GetNodeProp(x, NodeProperties.IsAgent)).filter(x => GetNodeTitle(x) !== 'User');
  const models = NodesByType(null, NodeTypes.Model).filter(x => !GetNodeProp(x, NodeProperties.IsAgent));
  const functionTypes = [
    FunctionTypes.Create_Object__Object,
    FunctionTypes.Get_Objects_From_List_Of_Ids,
    FunctionTypes.Update_Object_Agent_Value__Object,
    FunctionTypes.Get_Agent_Value__IListObject,
    FunctionTypes.Get_Object_Agent_Value__Object
  ];
  await agents.forEachAsync(async (agent, aindex) => {
    await models.forEachAsync(async (model, mindex) => {
      await functionTypes.forEachAsync(async (functionType, findex) => {

        const start = Date.now();
        const functionName = MethodFunctions[functionType].titleTemplate(GetNodeTitle(model), GetNodeTitle(agent));
        const result = [];
        result.push({
          method: {
            method: CreateAgentFunction({
              nodePackageType: functionName,
              methodType: MethodFunctions[functionType].method,
              model,
              agent,
              httpMethod: HTTP_METHODS.POST, //might not be used
              functionType,
              functionName
            })
          },
          methodType: functionType
        });
        executeGraphOperations(result)(GetDispatchFunc(), GetStateFunc());
        const total = Date.now() - start;
        const progress = ((aindex * models.length * functionTypes.length) + mindex * functionTypes.length + findex) / (agents.length * models.length * functionTypes.length);
        await progresFunc(progress, total * models.length * functionTypes.length * functionTypes.length * (1 - progress))
      });
    });
  });


  return [];
}
