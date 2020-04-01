import { NodesByType, GetDispatchFunc, GetStateFunc, graphOperation } from "../../actions/uiactions";
import { NodeTypes, UITypes } from "../../constants/nodetypes";
import SetupViewTypeFor from "../viewtype/SetupViewTypeFor";

export default function SetupViewTypes() {
  const viewTypes = NodesByType(null, NodeTypes.ViewType);
  viewTypes.forEach(node => {
    [UITypes.ElectronIO, UITypes.ReactNative].forEach(uiType => {
      graphOperation(SetupViewTypeFor({ node: node.id, uiType, eventTypeHandler: true, eventType: 'onChange' }))(GetDispatchFunc(), GetStateFunc());
      graphOperation(SetupViewTypeFor({ node: node.id, uiType, eventTypeHandler: true, eventType: 'onChange', skipClear: true }))(GetDispatchFunc(), GetStateFunc());
    })
  })
}
