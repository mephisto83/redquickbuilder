import { NodeProperties, Methods } from "../../constants/nodetypes";
import { uuidv4 } from "../../utils/array";
import { GetNodeProp, UPDATE_NODE_PROPERTY } from "../../actions/uiactions";
import SetupViewTypeForCreate from "./SetupViewTypeForCreate";
import SetupViewTypeForGetAll from "./SetupViewTypeForGetAll";
import AttachGetAllOnComponentDidMount from "./AttachGetAllOnComponentDidMount";
import { setViewPackageStamp } from "../../methods/graph_methods";
import RemoveAllViewPackage from "../RemoveAllViewPackage";

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
  const lastViewPackage = GetNodeProp(node, NodeProperties.LastViewPackage);
  if (lastViewPackage) {
    result.push(...RemoveAllViewPackage({ view: lastViewPackage }))
  }
  setViewPackageStamp(viewPackages, 'setup-view-type-for');
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
  result.push({
    operation: UPDATE_NODE_PROPERTY,
    options: {
      id: node,
      properties: {
        [NodeProperties.LastViewPackage]: viewPackages[NodeProperties.ViewPackage]
      }
    }
  })
  result.push(() => {
    setViewPackageStamp(null, 'setup-view-type-for');
    return [];
  })
  return result;
}
