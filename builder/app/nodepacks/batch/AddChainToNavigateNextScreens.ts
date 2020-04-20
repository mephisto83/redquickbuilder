import { GetNodeByProperties, GetNodesByProperties, graphOperation, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeProperties, NodeTypes } from "../../constants/nodetypes";
import { AuthorizedDashboard, SelectTargetScreen } from "../../components/titles";
import AddChainToNavigateNextScreen from "./AddChainToNavigateNextScreen";

export default async function AddChainToNavigateNextScreens(progresFunc) {
  const screen = GetNodeByProperties({
    [NodeProperties.UIText]: AuthorizedDashboard,
    [NodeProperties.NODEType]: NodeTypes.Screen
  });
  const dataChains = GetNodesByProperties({
    [NodeProperties.UIText]: SelectTargetScreen,
    [NodeProperties.NODEType]: NodeTypes.DataChain
  })
  if (!screen) {
    throw new Error('no screen found');
  }
  if (!dataChains || !dataChains.length) {
    throw new Error('No Target Screen Data chains found');
  }
  await dataChains.forEachAsync(async (dataChain, index, length) => {
    const result = [];
    const start = Date.now();
    result.push(...AddChainToNavigateNextScreen({ dataChain: dataChain.id, screen: screen.id }));
    graphOperation(result)(GetDispatchFunc(), GetStateFunc());
    if (progresFunc) {
      const total = Date.now() - start;
      await progresFunc(index / length, total * (length - index));
    }
  });

  return [];
}
