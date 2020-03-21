import { NodeProperties, Methods } from "../../constants/nodetypes";
import { uuidv4 } from "../../utils/array";
import { GetNodeProp } from "../../actions/uiactions";
import SetupViewTypeForCreate from "./SetupViewTypeForCreate";
import SetupViewTypeForGetAll from "./SetupViewTypeForGetAll";
import AttachGetAllOnComponentDidMount from "./AttachGetAllOnComponentDidMount";

export default function SetupViewTypeFor(args = {}) {
  const {
    node } = args;
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const context = { viewPackages, ...args }
  const result = [];

  switch (GetNodeProp(node, NodeProperties.ViewType)) {
    case Methods.Update:
    case Methods.Create:
      result.push(...SetupViewTypeForCreate(context));

      break;
    case Methods.Get:
    case Methods.GetAll:
      result.push(...SetupViewTypeForGetAll(context));
      break;
    default: break;
  }

  result.push(...AttachGetAllOnComponentDidMount(context));

  return result;
}
