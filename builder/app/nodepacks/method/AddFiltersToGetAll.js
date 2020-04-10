import {
  NodesByType,
  GetNodeProp,
  GetNodeTitle,
  NEW_MODEL_ITEM_FILTER,
  GetMethodNodeProp,
  UPDATE_NODE_PROPERTY,
  graphOperation,
  GetDispatchFunc,
  GetStateFunc
} from "../../actions/uiactions";
import {
  MethodFunctions,
  FunctionTemplateKeys
} from "../../constants/functiontypes";
import {
  NodeProperties,
  Methods,
  LinkType,
  LinkProperties,
  NodeTypes
} from "../../constants/nodetypes";
import { GetNodeLinkedTo } from "../../methods/graph_methods";

export default function AddFiltersToGetAll(progresFunc) {
  const methods = NodesByType(null, NodeTypes.Method).filter(
    x => (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === Methods.GetAll)
    .filter(x => !GetNodeLinkedTo(null, {
        id: x.id,
        link: LinkType.ModelItemFilter
      }));

  methods.forEachAsync(async (method, index, length) => {
    const result = [];
    let nodeInstance = null;
    result.push(
      {
        operation: NEW_MODEL_ITEM_FILTER,
        options: {
          parent: method.id,
          groupProperties: {},
          linkProperties: {
            properties: { ...LinkProperties.ModelItemFilter }
          },
          callback: node => {
            nodeInstance = node;
          }
        }
      },
      () => ({
        operation: UPDATE_NODE_PROPERTY,
        options() {
          return {
            id: nodeInstance.id,
            properties: {
              [NodeProperties.UIText]: `${GetNodeTitle(
                method
              )} Filter`
            }
          }
        }
      })
    );

    graphOperation(result)(GetDispatchFunc(), GetStateFunc());

    await progresFunc(index / length);
  });

}

AddFiltersToGetAll.title = "Add Filters to GetALL methods";
AddFiltersToGetAll.description =
  "Adds default filters to all the get all methods";
