import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, } from "../../actions/uiactions";
import { UITypes, NodeProperties, NodeTypes, Methods } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";
import PostAuthenticate from "../PostAuthenticate";

export default function AnonymousGuest(args) {
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
          [NodeProperties.UIText]: `Red Anonymous Login Model`
        },
        callback: newNode => {
          newStuff.anonymousRegisterLoginModel = newNode.id;
        }
      }
    }])(GetDispatchFunc(), GetStateFunc());

  const anonymousRegisterLogin = CreateAgentFunction({
    viewPackage,
    model: GetNodeById(newStuff.anonymousRegisterLoginModel, newStuff.graph),
    agent: {},
    maestro,
    nodePackageType: "register-login-anonymous-user",
    methodType: Methods.Create,
    user: NodesByType(GetState(), NodeTypes.Model).find(x =>
      GetNodeProp(x, NodeProperties.IsUser)
    ),
    httpMethod: HTTP_METHODS.POST,
    functionType: FunctionTypes.AnonymousRegisterLogin,
    functionName: `Anonymous Register and Authenticate`
  })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });

  const continueMethodResults = CreateDefaultView.method({
    viewName: 'Anonymous Guest',
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

  addInstanceEventsToForms({
    method_results: continueMethodResults,
    targetMethod: anonymousRegisterLogin.methodNode.id
  });

  if (continueMethodResults.instanceFunc) {
    PerformGraphOperation([
      ...PostAuthenticate({
        screen: null,
        functionName: "Post Authenticate ReactNative",
        pressInstance: continueMethodResults.instanceFunc.onPress
      }),
      ...PostAuthenticate({
        screen: null,
        functionName: "Post Authenticate ElectronIo",
        clickInstance: continueMethodResults.instanceFunc.onClick
      })
    ])(GetDispatchFunc(), GetStateFunc());
  }

  return {
    screenNodeId: continueMethodResults.screenNodeId
  }
}
