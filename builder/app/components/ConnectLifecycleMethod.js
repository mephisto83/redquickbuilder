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
  GetNodeTitle
} from "../actions/uiactions";
import * as GraphMethods from "../methods/graph_methods";
export default function(args = {}) {
  let { target, source, viewPackages } = args;
  let state = GetState();
  viewPackages = viewPackages || {};

  let apiConnectors = GraphMethods.GetConnectedNodesByType(
    state,
    source,
    NodeTypes.ComponentApiConnector
  ).map(x => {
    return {
      operation: REMOVE_NODE,
      options: {
        id: x.id
      }
    };
  });

  let lifeCycleMethod = GraphMethods.GetConnectedNodeByType(state, source, [
    NodeTypes.LifeCylceMethod,
    NodeTypes.EventMethod
  ]);
  let model = GraphMethods.GetConnectedNodeByType(state, lifeCycleMethod.id, [
    NodeTypes.Model
  ]);
  let dataChain = model
    ? GraphMethods.GetConnectedNodeByType(state, model.id, [
        NodeTypes.DataChain
      ])
    : null;
  let selectorNode = model
    ? GraphMethods.GetConnectedNodeByType(state, model.id, [NodeTypes.Selector])
    : null;
  let componentNode = GraphMethods.GetConnectedNodeByType(
    state,
    lifeCycleMethod.id,
    [NodeTypes.ComponentNode, NodeTypes.Screen, NodeTypes.ScreenOption]
  );

  let apiEndpoints = [];
  GraphMethods.GetConnectedNodesByType(
    state,
    target,
    NodeTypes.MethodApiParameters
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
        NodeTypes.MethodApiParameters
      ).map(queryParam => {
        if (GetNodeProp(queryParam, NodeProperties.QueryParameterParam)) {
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
    })
  ];

  return result;
}
