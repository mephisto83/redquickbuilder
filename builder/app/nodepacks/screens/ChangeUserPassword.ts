import { CreateDefaultView, addInstanceEventsToForms, CreateAgentFunction } from "../../constants/nodepackages";
import { GetDispatchFunc, GetStateFunc, GetNodeById, ADD_NEW_NODE, PerformGraphOperation, NodesByType, GetState, GetNodeProp, ValidationPropName, } from "../../actions/uiactions";
import { UITypes, NodeProperties, NodeTypes, Methods, LinkProperties, NodePropertyTypes } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { HTTP_METHODS, FunctionTypes } from "../../constants/functiontypes";
import { ComponentTypeKeys } from "../../constants/componenttypes";

export default function ChangeUserPassword(args) {
  const { viewPackage, maestro, graph, uiTypeConfig } = args;
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
          [NodeProperties.UIText]: `Change Password View Model`
        },
        callback: newNode => {
          newStuff.functionModel = newNode.id;
        }
      }
    },
    function changePassword() {
      return [
        { propName: "Old Password", componentType: ComponentTypeKeys.Password },
        { propName: "New Password", componentType: ComponentTypeKeys.Password, validationProp: ValidationPropName.Password },
        { propName: "Confirm Password", componentType: ComponentTypeKeys.Password, validationProp: ValidationPropName.PasswordConfirm }
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
    functionType: FunctionTypes.ChangeUserPassword,
    functionName: `Change User Password`
  })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });

  const continueMethodResults = CreateDefaultView.method({
    viewName: 'Change User Password',
    dispatch: GetDispatchFunc(),
    getState: GetStateFunc(),
    model: GetNodeById(newStuff.functionModel, graph),
    isSharedComponent: false,
    isDefaultComponent: false,
    isPluralComponent: false,
    uiTypes: uiTypeConfig,
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

  return {
    screenNodeId: continueMethodResults.screenNodeId
  }
}
