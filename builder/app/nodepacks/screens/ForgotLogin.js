import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, } from "../../actions/uiactions";
import { UITypes, NodeProperties, NodeTypes, Methods, LinkProperties, NodePropertyTypes } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";
import { ComponentTypeKeys } from "../../constants/componenttypes";

export default function ForgotLogin(args) {
  const { viewPackage, maestro, graph } = args;
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
          [NodeProperties.UIText]: `Red Forgot Login Model`
        },
        callback: newNode => {
          newStuff.functionModel = newNode.id;
        }
      }
    },
    function forgotLoginModel() {
      return [
        { propName: "Email" }
      ].map(v => {
        const { propName, componentType = ComponentTypeKeys.Input } = v;
        return {
          operation: ADD_NEW_NODE,
          options: {
            nodeType: NodeTypes.Property,
            linkProperties: {
              properties: { ...LinkProperties.PropertyLink }
            },
            groupProperties: {},
            parent: newStuff.loginModel,
            properties: {
              ...viewPackage,
              [NodeProperties.Pinned]: false,
              [NodeProperties.ComponentType]: componentType,
              [NodeProperties.UIAttributeType]: NodePropertyTypes.STRING,
              [NodeProperties.UIText]: propName
            }
          }
        };
      });
    }])(GetDispatchFunc(), GetStateFunc());

  // change to a function to check that the current credentials are still good.
  const anonymousRegisterLogin = CreateAgentFunction({
    viewPackage,
    model: GetNodeById(newStuff.functionModel, graph),
    agent: {},
    maestro,
    nodePackageType: "register-login-anonymous-user",
    methodType: Methods.Create,
    user: NodesByType(GetState(), NodeTypes.Model).find(x =>
      GetNodeProp(x, NodeProperties.IsUser)
    ),
    httpMethod: HTTP_METHODS.POST,
    functionType: FunctionTypes.ForgotLogin,
    functionName: `Forgot Login`
  })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });

  const continueMethodResults = CreateDefaultView.method({
    viewName: 'Forgot Login',
    dispatch: GetDispatchFunc(),
    getState: GetStateFunc(),
    model: GetNodeById(newStuff.functionModel, graph),
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

  return {
    screenNodeId: continueMethodResults.screenNodeId
  }
}
