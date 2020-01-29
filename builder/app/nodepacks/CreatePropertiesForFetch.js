import { GetNodesLinkedTo } from "../methods/graph_methods";
import {
  LinkType,
  NodeTypes,
  NodeProperties,
  LinkProperties
} from "../constants/nodetypes";
import {
  ADD_NEW_NODE,
  GetNodeProp,
  GetNodeTitle,
  GetCurrentGraph,
  GetMethodsProperty,
  GetNodeById,
  REMOVE_NODE
} from "../actions/uiactions";
import { FunctionTemplateKeys } from "../constants/functiontypes";

export default function(args = {}) {
  let { id } = args;
  debugger;
  let fetchServices = GetNodesLinkedTo(GetCurrentGraph(), {
    id,
    link: LinkType.FetchServiceOuput
  });

  let result = [];

  if (fetchServices && fetchServices.length) {
    let fetchService = fetchServices[0];
    GetNodesLinkedTo(GetCurrentGraph(), {
      id,
      link: LinkType.PropertyLink
    }).map(v => {
      result.push({
        operation: REMOVE_NODE,
        options: {
          id: v.id
        }
      });
    });
    let models = GetNodesLinkedTo(GetCurrentGraph(), {
      id: fetchService.id,
      link: LinkType.FetchService
    })
      .map(model => {
        let methodprops =
          GetNodeProp(model.id, NodeProperties.MethodProps) || {};
        return (
          methodprops[FunctionTemplateKeys.ModelOutput] ||
          methodprops[FunctionTemplateKeys.Model]
        );
      })
      .filter(x => x)
      .unique()
      .map(v => GetNodeById(v));

    models.map(model => {
      result.push({
        operation: ADD_NEW_NODE,
        options: function() {
          return {
            nodeType: NodeTypes.Property,
            parent: id,
            properties: {
              [NodeProperties.UseModelAsType]: true,
              [NodeProperties.UIModelType]: model.id,
              [NodeProperties.UIText]: GetNodeTitle(model),
              [NodeProperties.IsTypeList]: true
            },
            groupProperties: {},
            linkProperties: {
              properties: { ...LinkProperties.PropertyLink }
            },
            links: [
              {
                target: model.id,
                linkProperties: {
                  properties: { ...LinkProperties.ModelTypeLink }
                }
              }
            ]
          };
        }
      });
    });
  }
  return result;
}
