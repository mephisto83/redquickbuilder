import {
  NodesByType,
  GetNodeProp,
  GetNodeTitle,
  NEW_MODEL_ITEM_FILTER,
  GetMethodNodeProp,
  UPDATE_NODE_PROPERTY
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

export default function AddFiltersToGetAll() {
  let methods = NodesByType(null, NodeTypes.Method);
  let result = [];
  methods
    .filter(
      x =>
        (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {})
          .method === Methods.GetAll
    )
    .filter(x => {
      return !GetNodeLinkedTo(null, {
        id: x.id,
        link: LinkType.ModelItemFilter
      });
    })
    .map(method => {
      let _node = null;
      let methodProps =
        GetMethodNodeProp(method, FunctionTemplateKeys.Agent) ||
        GetMethodNodeProp(method, FunctionTemplateKeys.User) ||
        "";
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
              _node = node;
            }
          }
        },
        function() {
          return {
            operation: UPDATE_NODE_PROPERTY,
            options: {
              id: _node.id,
              properties: {
                [NodeProperties.UIText]: `${GetNodeTitle(
                  method
                )} Filter`
              }
            }
          };
        }
      );
    });

  return result;
}

AddFiltersToGetAll.title = "Add Filters to GetALL methods";
AddFiltersToGetAll.description =
  "Adds default filters to all the get all methods";
