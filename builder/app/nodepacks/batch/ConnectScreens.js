import { NodesByType, GetNodeProp, GetMethodNodeProp, GetStateFunc, GetDispatchFunc, graphOperation, ScreenOptionFilter } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import { MethodFunctions, FunctionTemplateKeys } from "../../constants/functiontypes";
import { ViewTypes } from "../../constants/viewtypes";
import ScreenConnectGet from "../screens/ScreenConnectGet";
import ScreenConnectGetAll from "../screens/ScreenConnectGetAll";
import ScreenConnectCreate from "../screens/ScreenConnectCreate";
import ScreenConnectUpdate from "../screens/ScreenConnectUpdate";
import CollectionDataChainsIntoCollections from "../CollectionDataChainsIntoCollections";

export default async function ConnectScreens(progresFunc) {
  const allscreens = NodesByType(null, NodeTypes.Screen);
  const screens = NodesByType(null, NodeTypes.Screen).filter(ScreenOptionFilter);
  await screens.forEachAsync(async (screen, index, total) => {
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
            navigateTo: navigateToScreens[0].id
          });
          break;
        case ViewTypes.GetAll:
          commands = ScreenConnectGetAll({
            method: methods[0].id,
            node: screen.id,
            navigateTo: navigateToScreens[0].id
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
            componentDidMountMethods: componentsDidMounts.map(x => x.id),
            node: screen.id
          });
          break;
        default: break;
      }
      commands.push(() => CollectionDataChainsIntoCollections());

      graphOperation([...commands])(GetDispatchFunc(), GetStateFunc());;
    }
    await progresFunc(index / total);
  });
}

export function GetPossibleNavigateScreens(screen, allscreens) {
  const screens = allscreens || NodesByType(null, NodeTypes.Screen);
  const viewType = GetNodeProp(screen, NodeProperties.ViewType);
  const screenModel = GetNodeProp(screen, NodeProperties.Model);

  return screens.filter(x => {
    if (viewType === ViewTypes.Get) {
      return (GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update);
    }
    return (GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Get);
  })
    .filter(x => {
      if (screenModel) {
        const modelOutput = GetNodeProp(x, NodeProperties.Model);
        return modelOutput === screenModel;
      }
      return true;
    });
}

export function GetPossibleComponentDidMount(screen) {
  const screenModel = GetNodeProp(screen, NodeProperties.Model);
  return NodesByType(null, NodeTypes.Method)
    .filter(
      x =>
        (
          MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === ViewTypes.Get
    )
    .filter(x => {
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

export function GetPossibleMethods(screen) {
  const viewType = GetNodeProp(screen, NodeProperties.ViewType);
  const screenModel = GetNodeProp(screen, NodeProperties.Model);

  return NodesByType(null, NodeTypes.Method)
    .filter(
      x => {
        const functionType = MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {};
        return functionType.method === viewType && !functionType.isFetchCompatible
      }
    )
    .filter(x => {
      if (screenModel) {
        const modelOutput =
          GetMethodNodeProp(x, FunctionTemplateKeys.ModelOutput) ||
          GetMethodNodeProp(x, FunctionTemplateKeys.Model);
        return modelOutput === screenModel;
      }
      return true;
    });
}
