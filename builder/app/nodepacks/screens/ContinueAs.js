import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, } from "../../actions/uiactions";
import { UITypes, NodeProperties, NodeTypes, Methods } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";

export default function ContinueAsScreen(args) {
  const { viewPackage, graph, maestro } = args;
  const newStuff = {};

  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options: {
        nodeType: NodeTypes.Model,
        // groupProperties: {},
        properties: {
          ...viewPackage,
          [NodeProperties.ExcludeFromController]: true,
          [NodeProperties.Pinned]: false,
          [NodeProperties.UIText]: `Red Check Login Model`
        },
        callback: newNode => {
          newStuff.anonymousRegisterLoginModel = newNode.id;
        }
      }
    }])(GetDispatchFunc(), GetStateFunc());

  // change to a function to check that the current credentials are still good.
  const anonymousRegisterLogin = CreateAgentFunction({
    viewPackage,
    model: GetNodeById(newStuff.anonymousRegisterLoginModel, graph),
    agent: {},
    maestro,
    nodePackageType: "register-login-anonymous-user",
    methodType: Methods.Create,
    modelNotRequired: true,
    user: NodesByType(GetState(), NodeTypes.Model).find(x =>
      GetNodeProp(x, NodeProperties.IsUser)
    ),
    httpMethod: HTTP_METHODS.POST,
    functionType: FunctionTypes.CheckUserLoginStatus,
    functionName: `Check User Login Status`
  })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });

  const continueMethodResults = CreateDefaultView.method({
    viewName: 'Continue As',
    dispatch: GetDispatchFunc(),
    getState: GetStateFunc(),
    model: GetNodeById(newStuff.anonymousRegisterLoginModel, graph),
    isSharedComponent: false,
    isDefaultComponent: false,
    isPluralComponent: false,
    uiTypes: {
      [UITypes.ReactNative]: args[UITypes.ReactNative] || false,
      [UITypes.ElectronIO]: args[UITypes.ElectronIO] || false,
      [UITypes.VR]: args[UITypes.VR] || false,
      [UITypes.Web]: args[UITypes.Web] || false
    },
    chosenChildren: [],
    viewType: ViewTypes.Create
  });

  addInstanceEventsToForms({
    method_results: continueMethodResults,
    targetMethod: anonymousRegisterLogin.methodNode.id
  });

  return {
    screenNodeId: continueMethodResults.screenNodeId
  }
}
