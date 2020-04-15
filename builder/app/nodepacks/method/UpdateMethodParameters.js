import { GetNodesLinkedTo } from "../../methods/graph_methods";
import * as GraphMethods from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ADD_NEW_NODE
} from "../../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties,
  NodeTypes
} from "../../constants/nodetypes";
import { uuidv4 } from "../../utils/array";
import { MethodFunctions } from "../../constants/functiontypes";
import * as Titles from '../../components/titles';

export default function UpdateMethodParameters(args = { methodType, current }) {
  let { methodType, current } = args;
  if (!methodType) {
    throw "no node";
  }
  if (!current) {
    throw "no method";
  }

  const graph = GetCurrentGraph();
  const result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  const toRemove = [];
  GetNodesLinkedTo(graph, {
    id: current
  })
    .filter(t => {
      return (
        GetNodeProp(t, NodeProperties.NODEType) ===
        NodeTypes.MethodApiParameters
      );
    })
    .map(t => {
      toRemove.push(t.id);
      const viewPackageId = GetNodeProp(t, NodeProperties.ViewPackage);
      if (viewPackageId)
        GetNodesByProperties({
          [NodeProperties.ViewPackage]: viewPackageId
        }).map(v => {
          toRemove.push(v.id);
        });
      GraphMethods.GetNodesLinkedTo(graph, {
        id: t.id
      })
        .filter(w => {
          return (
            GetNodeProp(w, NodeProperties.NODEType) ===
            NodeTypes.MethodApiParameters
          );
        })
        .map(v => {
          toRemove.push(v.id);
        });
    });

  result.push(
    ...toRemove.map(v => {
      return {
        operation: REMOVE_NODE,
        options() {
          return { id: v };
        }
      };
    })
  );
  if (MethodFunctions[methodType]) {
    const { parameters } = MethodFunctions[methodType];
    const newGroupId = uuidv4();
    if (parameters) {
      const { body } = parameters;
      const params = parameters.parameters;
      const operations = [
        body
          ? {
              operation: ADD_NEW_NODE,
              options() {
                return {
                  nodeType: NodeTypes.MethodApiParameters,
                  properties: {
                    ...viewPackages,
                    [NodeProperties.UIText]: Titles.Body,
                    [NodeProperties.UriBody]: true
                  },
                  links: [
                    {
                      target: current,
                      linkProperties: {
                        properties: {
                          ...LinkProperties.MethodApiParameters,
                          body: !!body
                        }
                      }
                    }
                  ]
                };
              }
            }
          : false
      ].filter(x => x);
      if (params) {
        const { query, template } = params;
        if (query) {
          let queryNodeId = null;
          operations.push(
            {
              operation: ADD_NEW_NODE,
              options() {
                return {
                  nodeType: NodeTypes.MethodApiParameters,
                  properties: {
                    ...viewPackages,
                    [NodeProperties.UIText]: "Query",
                    [NodeProperties.QueryParameterObject]: true
                  },
                  callback(queryNode) {
                    queryNodeId = queryNode.id;
                  },
                  links: [
                    {
                      target: current,
                      linkProperties: {
                        properties: {
                          ...LinkProperties.MethodApiParameters,
                          params: true,
                          query: true
                        }
                      }
                    }
                  ]
                };
              }
            },
            ...Object.keys(query).map(q => {
              return {
                operation: ADD_NEW_NODE,
                options() {
                  return {
                    nodeType: NodeTypes.MethodApiParameters,
                    groupProperties: {},
                    parent: queryNodeId,
                    properties: {
                      ...viewPackages,
                      [NodeProperties.UIText]: q,
                      [NodeProperties.QueryParameterParam]: true,
                      [NodeProperties.QueryParameterParamType]: q
                    },
                    linkProperties: {
                      properties: {
                        ...LinkProperties.MethodApiParameters,
                        parameter: q
                      }
                    }
                  };
                }
              };
            })
          );
        }
        if (template) {
          let templateParameterId = null;
          operations.push(
            {
              operation: ADD_NEW_NODE,
              options() {
                return {
                  nodeType: NodeTypes.MethodApiParameters,
                  properties: {
                    ...viewPackages,
                    [NodeProperties.UIText]: "TemplateParameters",
                    [NodeProperties.TemplateParameter]: true
                  },
                  callback(queryNode) {
                    templateParameterId = queryNode.id;
                  },
                  links: [
                    {
                      target: current,
                      linkProperties: {
                        properties: {
                          ...LinkProperties.MethodApiParameters,
                          params: true,
                          template: true
                        }
                      }
                    }
                  ]
                };
              }
            },
            ...Object.keys(template).map(q => {
              return {
                operation: ADD_NEW_NODE,
                options() {
                  return {
                    nodeType: NodeTypes.MethodApiParameters,
                    groupProperties: {},
                    parent: templateParameterId,
                    properties: {
                      ...viewPackages,
                      [NodeProperties.UIText]: q,
                      [NodeProperties.TemplateParameter]: true,
                      [NodeProperties.TemplateParameterType]: q
                    },
                    linkProperties: {
                      properties: {
                        ...LinkProperties.MethodApiParameters,
                        parameter: q
                      }
                    }
                  };
                }
              };
            })
          );
        }
      }
      result.push(...operations);
    }
  }
  return result;
}