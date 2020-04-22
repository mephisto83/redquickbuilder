import StoreModelArrayStandard from "../StoreModelArrayStandard";
import { GetViewTypeModel, GetNodeTitle, ADD_LINK_BETWEEN_NODES } from "../../actions/uiactions";
import AddComponentDidMountToViewTypeComponent from "./AddComponentDidMountToViewTypeComponent";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { LinkProperties } from "../../constants/nodetypes";

export default function AttachGetAllOnComponentDidMount(args : any= {}) {
  const result = [];
  const { node, functionToLoadModels, viewPackages, uiType } = args;
  const model = GetViewTypeModel(node);
  let storeModelArrayDC: any = null;
  let didMountContext: any = null;

  if (!model) {
    throw new Error('execpted model missing?')
  }

  result.push(...StoreModelArrayStandard({
    model,
    uiType,
    viewPackages,
    modelText: `${GetNodeTitle(model)} State`,
    state_key: `${GetNodeTitle(model)} State`,
    callback: (storeModelArrayContext: any) => {
      storeModelArrayDC = storeModelArrayContext.entry;
    }
  }), ...AddComponentDidMountToViewTypeComponent({
    ...args, callback: (didMountContextArgs: any) => {
      didMountContext = didMountContextArgs;
    }
  }), (graph: any) => {
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
