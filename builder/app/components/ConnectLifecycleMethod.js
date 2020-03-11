import {
  NodeTypes,
  NodeProperties,
  LinkProperties
} from "../constants/nodetypes";
import {
  GetNodeProp,
  REMOVE_NODE,
  GetCurrentGraph,
  GetState,
  ADD_LINK_BETWEEN_NODES,
  ADD_NEW_NODE,
  GetNodeByProperties,
  GetNodeTitle,
  NO_OP
} from "../actions/uiactions";
import * as GraphMethods from "../methods/graph_methods";
import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  let { target, source, viewPackages, graph } = args;
  let state = GetState();
  viewPackages = viewPackages || {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  let apiConnectors = GraphMethods.GetConnectedNodesByType(
    state,
    source,
    NodeTypes.ComponentApiConnector,
    null,
    graph
  ).map(x => {
    return {
      operation: REMOVE_NODE,
      options: {
        id: x.id
      }
    };
  });

  let lifeCycleMethod = GraphMethods.GetConnectedNodeByType(
    state,
    source,
    [NodeTypes.LifeCylceMethod, NodeTypes.EventMethod],
    null,
    graph
  );
  let model = GraphMethods.GetConnectedNodeByType(
    state,
    lifeCycleMethod.id,
    [NodeTypes.Model],
    null,
    graph
  );
  let dataChain = model
    ? GraphMethods.GetConnectedNodeByType(
        state,
        model.id,
        [NodeTypes.DataChain],
        null,
        graph
      )
    : null;
  let selectorNode = model
    ? GraphMethods.GetConnectedNodeByType(
        state,
        model.id,
        [NodeTypes.Selector],
        null,
        graph
      )
    : null;
  let componentNode = GraphMethods.GetConnectedNodeByType(
    state,
    lifeCycleMethod.id,
    [NodeTypes.ComponentNode, NodeTypes.Screen, NodeTypes.ScreenOption],
    null,
    graph
  );
  let context = {
    apiEndPoints: []
  };
  let apiEndpoints = [];
  GraphMethods.GetConnectedNodesByType(
    state,
    target,
    NodeTypes.MethodApiParameters,
    null,
    graph
  )
    .filter(x => {
      if (GetNodeProp(x, NodeProperties.QueryParameterObject)) {
        return true;
      }
      if (GetNodeProp(x, NodeProperties.UriBody)) {
        apiEndpoints.push(x);
        return false;
      }
      return true;
    })
    .map(queryObj => {
      GraphMethods.GetConnectedNodesByType(
        state,
        queryObj.id,
        NodeTypes.MethodApiParameters,
        null,
        graph
      ).map(queryParam => {
        if (GetNodeProp(queryParam, NodeProperties.QueryParameterParam)) {
          apiEndpoints.push(queryParam);
        } else if (GetNodeProp(queryParam, NodeProperties.TemplateParameter)) {
          apiEndpoints.push(queryParam);
        }
      });
    });

  let result = [
    ...apiConnectors,
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function() {
        return {
          target,
          source,
          properties: {
            ...LinkProperties.MethodCall
          }
        };
      }
    },
    ...apiEndpoints.map(ae => {
      return {
        operation: ADD_NEW_NODE,
        options: function() {
          let skipOrTake = GetNodeByProperties({
            [NodeProperties.QueryParameterType]: GetNodeProp(
              ae,
              NodeProperties.QueryParameterParamType
            ),
            [NodeProperties.NODEType]: NodeTypes.DataChain,
            [NodeProperties.Component]: componentNode.id,
            [NodeProperties.IsPaging]: true
          });
          if (model) {
          }
          if (dataChain) {
          }
          return {
            nodeType: NodeTypes.ComponentApiConnector,
            groupProperties: {},
            parent: source,
            properties: {
              [NodeProperties.UIText]: `${GetNodeTitle(ae)} Parameter`,
              ...viewPackages
            },
            callback: new_node => {
              context.apiEndPoints.push(new_node);
            },
            linkProperties: {
              properties: { ...LinkProperties.ComponentApiConnector }
            },
            links: [
              {
                target: ae.id,
                linkProperties: {
                  properties: {
                    ...LinkProperties.ComponentApiConnection
                  }
                }
              },
              skipOrTake
                ? {
                    target: skipOrTake.id,
                    linkProperties: {
                      properties: {
                        ...LinkProperties.ComponentApiConnection
                      }
                    }
                  }
                : null,
              dataChain
                ? {
                    target: dataChain.id,
                    linkProperties: {
                      properties: {
                        ...LinkProperties.ComponentApiConnection
                      }
                    }
                  }
                : null,
              selectorNode
                ? {
                    target: selectorNode.id,
                    linkProperties: {
                      properties: {
                        ...LinkProperties.ComponentApiConnection
                      }
                    }
                  }
                : null
            ].filter(x => x)
          };
        }
      };
    }),
    {
      operation: NO_OP,
      options: function(graph) {
        if (args.callback) {
          args.callback(context, graph);
        }
      }
    }
  ];

  return [...result];
}
