import { NodesByType, GetDispatchFunc, GetStateFunc, graphOperation, GetMethodNodeProp, GetNodeProp, GetViewTypeModel } from "../../actions/uiactions";
import { NodeTypes, UITypes, NodeProperties, Methods } from "../../constants/nodetypes";
import SetupViewTypeFor from "../viewtype/SetupViewTypeFor";
import { MethodFunctions, FunctionTemplateKeys } from "../../constants/functiontypes";

export default async function SetupViewTypes(progressFunc: any) {
  const viewTypes = NodesByType(null, NodeTypes.ViewType);
  await viewTypes.filter((x: any) => GetNodeProp(x, NodeProperties.ViewType) !== Methods.Delete).forEachAsync(async (node: any, index: any, length: any) => {
    const validationMethod = GetValidationMethodForViewType(node);
    const functionToLoadModels = GetFunctionToLoadModel(node);
    [
      UITypes.ElectronIO,
      UITypes.ReactWeb,
      UITypes.ReactNative
    ].forEach(uiType => {
      const result = [];
      result.push(...SetupViewTypeFor({
        validationMethod: validationMethod ? validationMethod.id : null,
        functionToLoadModels: functionToLoadModels ? functionToLoadModels.id : null,
        node: node.id, uiType, eventTypeHandler: true, eventType: 'onChange', skipClear: true
      }));
      graphOperation([...result])(GetDispatchFunc(), GetStateFunc())
    })
    await progressFunc(index / length);
  })
}


export function GetValidationMethodForViewTypes(node: any) {
  const viewTypeModel = node ? GetViewTypeModel(node.id) : null;
  const methodType = GetNodeProp(node, NodeProperties.ViewType);
  return NodesByType(null, NodeTypes.Method)
    .filter(
      (x: any) => [methodType].some(meth => meth === (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method)
    )
    .filter((x: any) => {
      if (viewTypeModel) {
        const modelOutput = GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) || GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return viewTypeModel && modelOutput === viewTypeModel.id;
      }
      return false;
    })
}

export function GetValidationMethodForViewType(node: any) {
  return GetValidationMethodForViewTypes(node).find((x: any) => x);
}

export function GetFunctionToLoadModels(node: any) {
  const viewTypeModel = node ? GetViewTypeModel(node.id) : null;
  return NodesByType(null, NodeTypes.Method)
    .filter((x: any) => {
      const functionType = (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {})
      return functionType.method === Methods.GetAll
    })
    .filter((x: any) => {
      const functionType = (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {})
      return !functionType.isFetchCompatible
    })
    .filter((x: any) => {
      if (viewTypeModel) {
        const modelOutput = GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) || GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return viewTypeModel && modelOutput === viewTypeModel.id;
      }
      return false;
    });
}
export function GetFunctionToLoadModel(node: any) {
  return GetFunctionToLoadModels(node).find((x: any) => x);
}
