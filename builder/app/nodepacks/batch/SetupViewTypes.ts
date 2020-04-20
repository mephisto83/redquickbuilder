import { NodesByType, GetDispatchFunc, GetStateFunc, graphOperation, GetMethodNodeProp, GetNodeProp, GetViewTypeModel } from "../../actions/uiactions";
import { NodeTypes, UITypes, NodeProperties, Methods } from "../../constants/nodetypes";
import SetupViewTypeFor from "../viewtype/SetupViewTypeFor";
import { MethodFunctions, FunctionTemplateKeys } from "../../constants/functiontypes";

export default async function SetupViewTypes(progressFunc) {
  const viewTypes = NodesByType(null, NodeTypes.ViewType);
  await viewTypes.filter(x => GetNodeProp(x, NodeProperties.ViewType) !== Methods.Delete).forEachAsync(async (node, index, length) => {
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


export function GetValidationMethodForViewTypes(node) {
  const viewTypeModel = node ? GetViewTypeModel(node.id) : null;
  const methodType = GetNodeProp(node, NodeProperties.ViewType);
  return NodesByType(null, NodeTypes.Method)
    .filter(
      x => [methodType].some(meth => meth === (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method)
    )
    .filter(x => {
      if (viewTypeModel) {
        const modelOutput = GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) || GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return viewTypeModel && modelOutput === viewTypeModel.id;
      }
      return false;
    })
}

export function GetValidationMethodForViewType(node) {
  return GetValidationMethodForViewTypes(node).find(x => x);
}

export function GetFunctionToLoadModels(node) {
  const viewTypeModel = node ? GetViewTypeModel(node.id) : null;
  return NodesByType(null, NodeTypes.Method)
    .filter(x => {
      const functionType = (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {})
      return functionType.method === Methods.GetAll
    })
    .filter(x => {
      const functionType = (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {})
      return !functionType.isFetchCompatible
    })
    .filter(x => {
      if (viewTypeModel) {
        const modelOutput = GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) || GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return viewTypeModel && modelOutput === viewTypeModel.id;
      }
      return false;
    });
}
export function GetFunctionToLoadModel(node) {
  return GetFunctionToLoadModels(node).find(x => x);
}
