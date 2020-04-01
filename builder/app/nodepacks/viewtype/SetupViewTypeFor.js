import { NodeProperties, Methods, LinkPropertyKeys, UITypes, NodeTypes } from "../../constants/nodetypes";
import { uuidv4 } from "../../utils/array";
import { GetNodeProp, UPDATE_NODE_PROPERTY, UPDATE_LINK_PROPERTY } from "../../actions/uiactions";
import SetupViewTypeForCreate from "./SetupViewTypeForCreate";
import SetupViewTypeForGetAll from "./SetupViewTypeForGetAll";
import AttachGetAllOnComponentDidMount from "./AttachGetAllOnComponentDidMount";
import { setViewPackageStamp, GetLinkBetween, GetNodesLinkedTo } from "../../methods/graph_methods";
import RemoveAllViewPackage from "../RemoveAllViewPackage";
import AppendViewTypeValidation from "./AppendViewTypeValidation";
import CollectionDataChainsIntoCollections from "../CollectionDataChainsIntoCollections";

export default function SetupViewTypeFor(args = {}) {
  const {
    skipClear = false,
    node,
    uiType = UITypes.ElectronIO
  } = args;
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const component = GetNodesLinkedTo(null, {
    id: node,
    componentType: NodeTypes.ComponentNode
  }).find(v => GetNodeProp(v, NodeProperties.UIType) === uiType);
  if (!component) {
    console.warn('no component found for ' + uiType);
    return [];
  }
  const context = { uiType, viewPackages, ...args }
  const result = [];
  const lastViewPackage = GetNodeProp(node, NodeProperties.LastViewPackage);
  if (lastViewPackage && !skipClear) {
    result.push(...RemoveAllViewPackage({ view: lastViewPackage }))
  }
  setViewPackageStamp(viewPackages, 'setup-view-type-for');
  const viewType = GetNodeProp(node, NodeProperties.ViewType);
  let createUpdateContext = null;

  switch (viewType) {
    case Methods.Update:
    case Methods.Create:
      result.push(...SetupViewTypeForCreate({
        ...context, callback: (setviewContext) => {
          createUpdateContext = setviewContext;
        }
      }));
      if (viewType === Methods.Update) {
        result.push((ggraph) => {
          const { eventTypeInstanceNode, eventTypeNode } = createUpdateContext;
          const link = GetLinkBetween(eventTypeNode, eventTypeInstanceNode, ggraph);
          if (link) {
            return ({
              operation: UPDATE_LINK_PROPERTY,
              options: {
                prop: LinkPropertyKeys.InstanceUpdate,
                value: true,
                id: link.id
              }
            });
          }
        });
      }
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
  result.push(...AppendViewTypeValidation({ method: args.validationMethod, ...args }));
  result.push(() => {
    setViewPackageStamp(null, 'setup-view-type-for');
    return [];
  })
  result.push(() => {
    return CollectionDataChainsIntoCollections();
  })
  return result;
}
