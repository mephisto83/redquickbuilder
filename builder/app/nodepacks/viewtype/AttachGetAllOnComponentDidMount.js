import StoreModelArrayStandard from "../StoreModelArrayStandard";
import { GetViewTypeModel, GetNodeTitle, ADD_LINK_BETWEEN_NODES } from "../../actions/uiactions";
import AddComponentDidMountToViewTypeComponent from "./AddComponentDidMountToViewTypeComponent";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { LinkProperties } from "../../constants/nodetypes";

export default function AttachGetAllOnComponentDidMount(args = {}) {
  const result = [];
  const { node, functionToLoadModels } = args;
  const model = GetViewTypeModel(node);
  let storeModelArrayDC = null;
  let didMountContext = null;

  result.push(...StoreModelArrayStandard({
    model,
    state_key: `${GetNodeTitle(model)} State`,
    callback: (storeModelArrayContext) => {
      storeModelArrayDC = storeModelArrayContext.entry;
    }
  }), ...AddComponentDidMountToViewTypeComponent({
    ...args, callback: (didMountContextArgs) => {
      didMountContext = didMountContextArgs;
    }
  }), (graph) => {
    return ConnectLifecycleMethod({
      target: functionToLoadModels,
      source: didMountContext.lifeCycleInstance.id,
      graph
    })
  }, () => {
      const newLocal = {
        operation: ADD_LINK_BETWEEN_NODES,
        options() {
          return {
            target: storeModelArrayDC,
            properties: { ...LinkProperties.DataChainLink }
          };
        }
      };
    return [newLocal];
  });
  return result;
}
