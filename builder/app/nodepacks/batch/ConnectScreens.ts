import { NodesByType, GetNodeProp, GetMethodNodeProp, GetStateFunc, GetDispatchFunc, graphOperation, ScreenOptionFilter } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import { MethodFunctions, FunctionTemplateKeys } from "../../constants/functiontypes";
import { ViewTypes } from "../../constants/viewtypes";
import ScreenConnectGet from "../screens/ScreenConnectGet";
import ScreenConnectGetAll from "../screens/ScreenConnectGetAll";
import ScreenConnectCreate from "../screens/ScreenConnectCreate";
import ScreenConnectUpdate from "../screens/ScreenConnectUpdate";
import CollectionDataChainsIntoCollections from "../CollectionDataChainsIntoCollections";

export default async function ConnectScreens(progresFunc: any) {
  const allscreens = NodesByType(null, NodeTypes.Screen);
  const screens = allscreens.filter(ScreenOptionFilter);
  await screens.forEachAsync(async (screen: any, index: any, total: any) => {
    const viewType = GetNodeProp(screen, NodeProperties.ViewType);

    const methods = GetPossibleMethods(screen);

    const navigateToScreens = GetPossibleNavigateScreens(screen, allscreens);

    const componentsDidMounts = GetPossibleComponentDidMount(screen);

    if (methods.length) {
      let commands = [];
      switch (viewType) {
        case ViewTypes.Get:
          commands = ScreenConnectGet({
            method: methods[0].id,
            node: screen.id,
            navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
          });
          break;
        case ViewTypes.GetAll:
          commands = ScreenConnectGetAll({
            method: methods[0].id,
            node: screen.id,
            navigateTo: navigateToScreens.length ? navigateToScreens[0].id : null
          });
          break;
        case ViewTypes.Create:
          commands = ScreenConnectCreate({
            method: methods[0].id,
            node: screen.id
          });
          break;
        case ViewTypes.Update:
          commands = ScreenConnectUpdate({
            method: methods[0].id,
            componentDidMountMethods: componentsDidMounts.map((x: any) => x.id),
            node: screen.id
          });
          break;
        default: break;
      }

      graphOperation([...commands])(GetDispatchFunc(), GetStateFunc());
    }
    await progresFunc(index / total);
  });
  graphOperation([() => CollectionDataChainsIntoCollections()])(GetDispatchFunc(), GetStateFunc());
}

export function GetPossibleNavigateScreens(screen: any, allscreens: any) {
  const screens = allscreens || NodesByType(null, NodeTypes.Screen);
  const viewType = GetNodeProp(screen, NodeProperties.ViewType);
  const screenModel = GetNodeProp(screen, NodeProperties.Model);
  const agentId = GetNodeProp(screen, NodeProperties.Agent);

  return screens.filter((x: { id: any; }) => x.id !== screen.id).filter((x: any) => {
    if (viewType === ViewTypes.Get) {
      return (GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update);
    }
    return (GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Get);
  })
    .filter((x: any) => {
      if (screenModel) {
        const agent =
          GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
        return agent === agentId;
      }
      return false;
    })
    .filter((x: any) => {
      if (screenModel) {
        const modelOutput = GetNodeProp(x, NodeProperties.Model);
        return modelOutput === screenModel;
      }
      return true;
    });
}

export function GetPossibleComponentDidMount(screen: any) {
  const screenModel = GetNodeProp(screen, NodeProperties.Model);
  return NodesByType(null, NodeTypes.Method)
    .filter(
      (      x: any) =>
        (
          MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === ViewTypes.Get
    )
    .filter((x: string | import("../../methods/graph_methods").Node) => {
      if (screenModel) {
        const modelOutput =
          GetMethodNodeProp(
            x,
            FunctionTemplateKeys.ModelOutput
          ) ||
          GetMethodNodeProp(
            x,
            FunctionTemplateKeys.Model
          );
        return modelOutput === screenModel;
      }
      return true;
    })
}

export function GetPossibleMethods(screen: any) {
  const viewType = GetNodeProp(screen, NodeProperties.ViewType);
  const screenModel = GetNodeProp(screen, NodeProperties.Model);
  const agentId = GetNodeProp(screen, NodeProperties.Agent);

  return NodesByType(null, NodeTypes.Method)
    .filter((x: string | import("../../methods/graph_methods").Node) => {
      if (screenModel) {
        const agent =
          GetMethodNodeProp(x, FunctionTemplateKeys.Agent);
        return agent === agentId;
      }
      return false;
    })
    .filter(
      (      x: any) => {
        const functionType = MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {};
        return functionType.method === viewType && !functionType.isFetchCompatible
      }
    )
    .filter((x: string | import("../../methods/graph_methods").Node) => {
      if (screenModel) {
        const modelOutput =
          GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
          GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return modelOutput === screenModel;
      }
      return true;
    });
}
