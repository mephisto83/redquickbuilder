import { NodesByType, GetNodeProp, GetNodeTitle, GetState, executeGraphOperations, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import { FunctionTypes, MethodFunctions, HTTP_METHODS } from "../../constants/functiontypes";
import { CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatch } from "../../templates/electronio/v1/app/actions/uiActions";

export default function AddAgentMethods() {
  const result = [];
  const agents = NodesByType(null, NodeTypes.Model).filter(x => GetNodeProp(x, NodeProperties.IsAgent)).filter(x => GetNodeTitle(x) !== 'User');
  const models = NodesByType(null, NodeTypes.Model).filter(x => !GetNodeProp(x, NodeProperties.IsAgent));
  const functionTypes = [
    FunctionTypes.Create_Object__Object,
    FunctionTypes.Get_Objects_From_List_Of_Ids,
    FunctionTypes.Update_Object_Agent_Value__Object,
    FunctionTypes.Get_Agent_Value__IListObject,
    FunctionTypes.Get_Object_Agent_Value__Object
  ];
  agents.forEach(agent => {
    models.forEach(model => {
      functionTypes.forEach(functionType => {

        const functionName = MethodFunctions[functionType].titleTemplate(GetNodeTitle(model), GetNodeTitle(agent));

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
      });
    });
  });

  executeGraphOperations(result)(GetDispatchFunc(), GetStateFunc());

  return [];
}
