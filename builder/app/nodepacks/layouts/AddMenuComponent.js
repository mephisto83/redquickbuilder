import { ComponentTypeKeys } from "../../constants/componenttypes";
import AddComponent from "../AddComponent";
import AddEvent from "../AddEvent";
import { GetNodeByProperties, NodeProperties, LinkProperties, $addComponentApiNodes, ComponentApiKeys, GetNodeProp, GetComponentExternalApiNode } from "../../actions/uiactions";
import { DataChainTypeNames } from "../../constants/datachain";
import NavigateToRoute from "../datachain/NavigateToRoute";
import { uuidv4 } from "../../utils/array";
import MenuDataSource from "../datachain/MenuDataSource";
import { UITypes } from "../../constants/nodetypes";

export default function AddMenuComponent(args = {}) {
  // node0,node1

  // menu_name, menu_name, index, menu_name, navigate_function
  if (!args.navigate_function) {
    throw new Error('missing navigate_function argument');
  } if (!args.menuGeneration) {
    throw new Error('missing menuGeneration argument');
  } if (!args.component) {
    throw new Error('missing component arguments');
  }
  else if (!args.buildMethod) {
    throw new Error('missing buildMethod');
  }
  else if (!args.eventType) {
    args.eventType = GetNodeProp(args.component, NodeProperties.UIType) === UITypes.ReactNative ? 'onPress' : 'onClick';
    args.uiType = GetNodeProp(args.component, NodeProperties.UIType);
  }
  if (!args.eventType) {
    throw new Error('missing eventType');
  }
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const result = [];
  const context = { ...args };
  result.push(...AddComponent({
    component: args.component,
    viewPackages,
    componentName: args.componentName,
    componentType: ComponentTypeKeys.Menu,
    callback: (menuContext) => {
      context.menu = menuContext.entry;
    }
  }), () => AddEvent({
    component: context.menu,
    eventType: args.eventType,
    eventTypeHandler: false,
    reverse: true,
    viewPackages,
    skipProperty: false,
    callback: (eventContext) => {
      context.eventTypeInstanceNode = eventContext.eventTypeInstanceNode;
    }
  }), () => {
    const dataChain = GetNodeByProperties({
      [NodeProperties.DataChainTypeName]: DataChainTypeNames.NavigateToRoute,
      [NodeProperties.UIType]: args.uiType
    })
    if (dataChain) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.eventTypeInstanceNode,
            target: dataChain.id,
            properties: { ...LinkProperties.DataChainLink }
          }
        }
      ];
    }
    return NavigateToRoute({
      menunavigate: `Navigate To Route`,
      viewPackages,
      uiType: args.uiType,
      callback: (navigcontext) => {
        context.navigateDataChain = navigcontext.entry;
      }
    })
  }, () => {
    if (context.navigateDataChain) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.eventTypeInstanceNode,
            target: context.navigateDataChain,
            properties: { ...LinkProperties.DataChainLink }
          }
        }
      ];
    }

    return [];
  }, (graph) => {
    const buildMethodDataChain = GetNodeByProperties({
      [NodeProperties.DataChainTypeName]: context.buildMethod,
      [NodeProperties.UIType]: args.uiType
    }, graph);
    if (!buildMethodDataChain) {
      return MenuDataSource({
        uiType: args.uiType,
        buildMethod: context.buildMethod,
        menu_name: `${context.buildMethod} ${args.uiType}`,
        menuGeneration: context.menuGeneration,
        navigate_function: context.navigate_function,
        component: context.component,
        callback: (menuDataSourceContext) => {
          context.menuDataSourceContext = menuDataSourceContext.entry;
        }
      });
    }
    context.menuDataSourceContext = buildMethodDataChain.id;
    return [];
  }, (gg) => {

    const valueApi = GetComponentExternalApiNode(ComponentApiKeys.Value, context.menu, gg);
    if (valueApi) {
      context.externalApi = valueApi.id;
      return [];
    }
    return $addComponentApiNodes(context.menu, ComponentApiKeys.Value, null, viewPackages, (apiNodeContext) => {
      context.externalApi = apiNodeContext.externalApi
    })
  },
    () => [
      {
        operation: "ADD_LINK_BETWEEN_NODES",
        options: {
          source: context.externalApi,
          target: context.menuDataSourceContext,
          properties: { ...LinkProperties.DataChainLink }
        }
      }
    ], () => {
      if (args.callback) {
        context.entry = context.menu;
        args.callback(context);
      }
      return [];
    });

  return result;
}
