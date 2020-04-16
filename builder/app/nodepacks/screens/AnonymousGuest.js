import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, } from "../../actions/uiactions";
import { UITypes, NodeProperties, NodeTypes, Methods } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";
import PostAuthenticate from "../PostAuthenticate";

export default function AnonymousGuest(args) {
  const { viewPackage, graph, maestro, uiTypeConfig } = args;
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
    uiTypes: uiTypeConfig,
    chosenChildren: [],
    viewType: ViewTypes.Create
  });
  Object.keys(uiTypeConfig).forEach(key => {
    if (uiTypeConfig[key]) {

      addInstanceEventsToForms({
        method_results: continueMethodResults,
        uiType: key,
        targetMethod: anonymousRegisterLogin.methodNode.id
      });
    }
  });

  if (continueMethodResults.instanceFunc) {
    Object.keys(uiTypeConfig).forEach(uiType => {
      if (uiTypeConfig[uiType]) {
        if (!continueMethodResults.uiTypes[uiType]) {
          throw new Error('missing uiType in anonymous guest');
        }
        PerformGraphOperation([
          ...PostAuthenticate({
            screen: null,
            uiType,
            functionName: `Post Authenticate ${uiType}`,
            pressInstance: uiType === UITypes.ReactNative ? continueMethodResults.uiTypes[uiType].instanceFunc.onPress : continueMethodResults.uiTypes[uiType].instanceFunc.onClick
          })
        ])(GetDispatchFunc(), GetStateFunc());
      }
    });
  }

  return {
    screenNodeId: continueMethodResults.screenNodeId
  }
}
