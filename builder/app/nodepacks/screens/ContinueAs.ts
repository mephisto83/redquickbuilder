import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, } from "../../actions/uiActions";
import { UITypes, NodeProperties, NodeTypes, Methods } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";

export default function ContinueAsScreen(args: any) {
  const { viewPackage, graph, maestro, uiTypeConfig } = args;
  const newStuff: any = {};

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
          [NodeProperties.UIText]: `Red Continue As Login Model`
        },
        callback: (newNode: any) => {
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
    user: NodesByType(GetState(), NodeTypes.Model).find((x: any ) =>
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
      [UITypes.ReactWeb]: args[UITypes.ReactWeb] || false
    },
    chosenChildren: [],
    viewType: ViewTypes.Create
  });
  Object.keys(uiTypeConfig).forEach(uiType => {
    if (uiTypeConfig[uiType]) {

      addInstanceEventsToForms({
        uiType,
        method_results: continueMethodResults,
        targetMethod: anonymousRegisterLogin.methodNode.id
      });
    }
  });

  return continueMethodResults;
}
