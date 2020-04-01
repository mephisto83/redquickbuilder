import { GetNodeByProperties, GetNodesByProperties } from "../../actions/uiactions";
import { NodeProperties, NodeTypes } from "../../constants/nodetypes";
import { AuthorizedDashboard, SelectTargetScreen } from "../../components/titles";
import AddChainToNavigateNextScreen from "./AddChainToNavigateNextScreen";

export default function AddChainToNavigateNextScreens() {
  let screen = GetNodeByProperties({
    [NodeProperties.UIText]: AuthorizedDashboard,
    [NodeProperties.NODEType]: NodeTypes.Screen
  });
  let dataChains = GetNodesByProperties({
    [NodeProperties.UIText]: SelectTargetScreen,
    [NodeProperties.NODEType]: NodeTypes.DataChain
  })
  if (!screen) {
    throw new Error('no screen found');
  }
  if (!dataChains || !dataChains.length) {
    throw new Error('No Target Screen Data chains found');
  }
  const result = [];
  dataChains.forEach(dataChain => {
    result.push(...AddChainToNavigateNextScreen({ dataChain: dataChain.id, screen: screen.id }))
  })
  return result;
}
