import StoreModelArrayStandard from "../StoreModelArrayStandard";
import { GetViewTypeModel, GetNodeTitle, ADD_LINK_BETWEEN_NODES } from "../../actions/uiactions";
import AddComponentDidMountToViewTypeComponent from "./AddComponentDidMountToViewTypeComponent";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { LinkProperties } from "../../constants/nodetypes";

export default function AttachGetAllOnComponentDidMount(args = {}) {
  const result = [];
  const { node, functionToLoadModels, viewPackages } = args;
  const model = GetViewTypeModel(node);
  let storeModelArrayDC = null;
  let didMountContext = null;

  result.push(...StoreModelArrayStandard({
    model,
    viewPackages,
    modelText: `${GetNodeTitle(model)} State`,
    state_key: `${GetNodeTitle(model)} State`,
    callback: (storeModelArrayContext) => {
      storeModelArrayDC = storeModelArrayContext.entry;
    }
  }), ...AddComponentDidMountToViewTypeComponent({
    ...args, callback: (didMountContextArgs) => {
      didMountContext = didMountContextArgs;
    }
  }), (graph) => {
    if (!didMountContext.skip) {
      return ConnectLifecycleMethod({
        target: functionToLoadModels,
        source: didMountContext.lifeCycleInstance.id,
        graph
      })
    }
    return []
  }, () => {
    const newLocal = {
      operation: ADD_LINK_BETWEEN_NODES,
      options() {
        return {
          target: storeModelArrayDC,
          source: didMountContext.lifeCycleInstance.id,
          properties: { ...LinkProperties.DataChainLink }
        };
      }
    };
    return [newLocal];
  });
  return result;
}
