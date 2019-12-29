import {
  NodeProperties,
  LinkProperties,
  GroupProperties,
  NodeTypes
} from "./nodetypes";
import {
  ADD_LINK_BETWEEN_NODES,
  CHANGE_NODE_PROPERTY,
  REMOVE_LINK_BETWEEN_NODES,
  ADD_NEW_NODE,
  SELECTED_NODE,
  GetNodeProp,
  GetDataChainNextId,
  Visual,
  GetCurrentGraph,
  GetState,
  GetNodeById,
  getGroup,
  GetNodesInGroup,
  REMOVE_NODE,
  SELECTED_TAB,
  DEFAULT_TAB,
  SIDE_PANEL_OPEN
} from "../actions/uiactions";
import {
  GetLinkBetween,
  getNodesGroups,
  getNodeLinks
} from "../methods/graph_methods";
export const DataChainFunctionKeys = {
  ModelProperty: "Model - Property",
  Required: "Required",
  Not: "Not",
  CollectResults: "Collect values",
  Selector: "Selector",
  EmailValidation: "Email validation",
  GreaterThan: "Greater Than",
  LessThan: "Less Than",
  MaxLength: "Max Length",
  MinLength: "Min Length",
  EqualsLength: "Equals Length",
  GreaterThanOrEqualTo: "Greater than or equal to",
  AlphaNumericLike: "Alphanumeric like",
  AlphaNumeric: "Alphanumeric",
  AlphaOnly: "Alpha only",
  LessThanOrEqualTo: "Less than or equal to",
  Equals: "Are Equal",
  BooleanAnd: "Boolean And",
  BooleanOr: "Boolean Or",
  Property: "Property",
  IfTrue: "IfTrue",
  Title: "Title",
  NumericalDefault: "Default (number)",
  IfFalse: "IfFalse",
  Model: "Model",
  Models: "Models", // Gets an array of models of a type
  Subset: "Subset", //Gets a subset of an array
  Sort: "Sort", //Sorts an array,
  Filter: "Filter", //Filters an array.
  Pass: "Pass",
  SetBearerAccessToken: "SetBearerAccessToken",
  ReferenceDataChain: "Data Chain Ref.",
  Merge: "Merge",
  Map: "Map",
  ArrayLength: "Array Length",
  ListReference: "List Reference",
  DataChainReferences: "DataChainReferences",
  StringConcat: "String Concat {0} {1}",
  SaveModelArrayToState: "Save Model Array To State",
  Navigate: "Navigate",
  NavigateTo: "Navigate To",
  GetModelIds: "Get Model Ids", // Get an array of model ids from an array
  SaveModelIdsToState: "Save Model Array Ids to State Under Key",
  NewRedGraph: "New Red Graph",
  AddUrlsToGraph: "Add Urls to Graph"
};
export const DataChainFunctions = {
  [DataChainFunctionKeys.Not]: {
    ui: {},
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Not"
  },
  [DataChainFunctionKeys.Title]: {
    ui: {
      value: NodeProperties.Value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Title"
  },
  [DataChainFunctionKeys.Selector]: {
    ui: {
      selectorProperty: NodeProperties.SelectorProperty,
      selector: NodeProperties.Selector
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Selector"
  },
  [DataChainFunctionKeys.Navigate]: {
    ui: {
      screen: NodeProperties.Screen,
      navigateMethod: NodeProperties.NavigationAction
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Navigate"
  },
  [DataChainFunctionKeys.NavigateTo]: {
    ui: {
      navigateMethod: NodeProperties.NavigationAction
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "NavigateTo"
  },
  [DataChainFunctionKeys.ListReference]: {
    ui: {
      list: NodeProperties.List
    },
    filter: {},
    value: DataChainFunctionKeys.ListReference
  },
  [DataChainFunctionKeys.Map]: {
    ui: {
      lambda: NodeProperties.Lambda
    },
    filter: {},
    value: DataChainFunctionKeys.Map
  },
  [DataChainFunctionKeys.Merge]: {
    ui: {
      lambda: NodeProperties.Lambda,
      datareferences: NodeProperties.DataChainReferences
    },
    filter: {},
    value: DataChainFunctionKeys.Merge
  },
  [DataChainFunctionKeys.IfTrue]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      value: NodeProperties.Value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "IfTrue"
  },
  [DataChainFunctionKeys.IfFalse]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      value: NodeProperties.Value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "IfFalse"
  },
  [DataChainFunctionKeys.Required]: {
    ui: {},
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Required"
  },
  [DataChainFunctionKeys.Property]: {
    ui: {
      model: NodeProperties.UIModelType,
      property: NodeProperties.Property
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "Property"
  },
  [DataChainFunctionKeys.BooleanAnd]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      node_2: NodeProperties.ChainNodeInput2
    },
    merge: true,
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "BooleanAnd"
  },
  [DataChainFunctionKeys.Equals]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      node_2: NodeProperties.ChainNodeInput2
    },
    merge: true,
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "AreEquals"
  },
  [DataChainFunctionKeys.BooleanOr]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      node_2: NodeProperties.ChainNodeInput2
    },
    merge: true,
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "BooleanOr"
  },
  [DataChainFunctionKeys.AlphaNumericLike]: {
    ui: {
      value: NodeProperties.value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "AlphaNumericLike"
  },
  [DataChainFunctionKeys.AlphaNumeric]: {
    ui: {
      value: NodeProperties.value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "AlphaNumeric"
  },
  [DataChainFunctionKeys.AlphaOnly]: {
    ui: {
      value: NodeProperties.value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "AlphaOnly"
  },
  [DataChainFunctionKeys.EmailValidation]: {
    ui: {
      value: NodeProperties.value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "email_validation"
  },
  [DataChainFunctionKeys.LessThanOrEqualTo]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "LessThanOrEqualTo"
  },
  [DataChainFunctionKeys.ArrayLength]: {
    ui: {
      value: NodeProperties.value
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "ArrayLength"
  },
  [DataChainFunctionKeys.NumericalDefault]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "NumericalDefault"
  },
  [DataChainFunctionKeys.GreaterThanOrEqualTo]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "GreaterThanOrEqualTo"
  },
  [DataChainFunctionKeys.EqualsLength]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "EqualsLength"
  },
  [DataChainFunctionKeys.MinLength]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "MinLength"
  },
  [DataChainFunctionKeys.MaxLength]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "MaxLength"
  },
  [DataChainFunctionKeys.LessThan]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "LessThan"
  },
  [DataChainFunctionKeys.GreaterThan]: {
    ui: {
      value: NodeProperties.value,
      number: NodeProperties.Number
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "greater_than_validation"
  },
  [DataChainFunctionKeys.SetBearerAccessToken]: {
    ui: {},
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "SetBearerAccessToken"
  },
  [DataChainFunctionKeys.ReferenceDataChain]: {
    ui: {
      dataref: NodeProperties.DataChainReference
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "reference_data_chain"
  },
  [DataChainFunctionKeys.ModelProperty]: {
    ui: {
      model: NodeProperties.UIModelType,
      property: NodeProperties.Property
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "model_property_selection"
  },
  [DataChainFunctionKeys.Model]: {
    ui: {
      model: NodeProperties.UIModelType,
      property: false
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "model_selection"
  },
  [DataChainFunctionKeys.Pass]: {
    ui: {},
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "pass_selection"
  },
  [DataChainFunctionKeys.NewRedGraph]: {
    ui: {},
    filter: {},
    value: DataChainFunctionKeys.NewRedGraph
  },
  [DataChainFunctionKeys.AddUrlsToGraph]: {
    ui: {},
    filter: {},
    value: DataChainFunctionKeys.AddUrlsToGraph
  },
  [DataChainFunctionKeys.Models]: {
    ui: {
      model: NodeProperties.UIModelType,
      property: false
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "models_selection"
  },
  [DataChainFunctionKeys.Filter]: {
    ui: {
      dataref: NodeProperties.DataChainReference
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "array_filter"
  },
  [DataChainFunctionKeys.Sort]: {
    ui: {
      dataref: NodeProperties.DataChainReference,
      compareref: NodeProperties.DataChainReference
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "array_sort"
  },
  [DataChainFunctionKeys.Subset]: {
    ui: {
      dataref: NodeProperties.DataChainReference
    },
    filter: {
      [NodeProperties.NODEType]: true
    },
    value: "array_subset"
  },
  [DataChainFunctionKeys.SaveModelArrayToState]: {
    ui: {
      model: NodeProperties.UIModelType
    },
    filter: {},
    value: DataChainFunctionKeys.SaveModelArrayToState
  },
  [DataChainFunctionKeys.GetModelIds]: {
    ui: {},
    filter: {},
    value: DataChainFunctionKeys.GetModelIds
  },
  //GetModelIds
  [DataChainFunctionKeys.SaveModelIdsToState]: {
    ui: {
      stateKey: NodeProperties.StateKey
    },
    filter: {},
    value: DataChainFunctionKeys.SaveModelIdsToState
  },
  [DataChainFunctionKeys.StringConcat]: {
    ui: {
      node_1: NodeProperties.ChainNodeInput1,
      node_2: NodeProperties.ChainNodeInput2
    },
    merge: true,
    filter: {
      [NodeProperties.MergeNode]: true
    },
    value: "string_concat_2_values"
  }
};
export function connectNodeChain(prop, reverse) {
  return function(currentNode, value) {
    var id = currentNode.id;
    this.props.graphOperation(
      connectNodeChainCommands(
        prop,
        id,
        value,
        currentNode.properties[prop],
        reverse
      )
    );
  };
}

export function connectNodeChainCommands(prop, id, value, source, reverse) {
  return [
    {
      operation: REMOVE_LINK_BETWEEN_NODES,
      options: {
        source: reverse ? id : source,
        target: reverse ? source : id
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: {
        prop,
        id,
        value
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: {
        source: reverse ? id : value,
        target: reverse ? value : id,
        properties: { ...LinkProperties.DataChainLink }
      }
    }
  ];
}

export function snipNodeFromInbetween() {
  return function(currentNode) {
    let graph = GetCurrentGraph(GetState());
    let links = getNodeLinks(graph, currentNode.id);
    if (links.length === 2) {
      let sourceNode = links
        .filter(v => v.target === currentNode.id)
        .map(t => GetNodeById(t.source))
        .find(x => x);
      let targetNode = links
        .filter(v => v.source === currentNode.id)
        .map(t => GetNodeById(t.target))
        .find(x => x);

      if (sourceNode && targetNode) {
        this.props.graphOperation([
          {
            operation: REMOVE_NODE,
            options: {
              id: currentNode.id
            }
          },
          {
            operation: ADD_LINK_BETWEEN_NODES,
            options: {
              source: sourceNode.id,
              target: targetNode.id,
              properties: { ...LinkProperties.DataChainLink }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: {
              prop: NodeProperties.ChainParent,
              id: targetNode.id,
              value: sourceNode.id
            }
          }
        ]);
        this.props.setVisual(SIDE_PANEL_OPEN, false);
        this.props.setVisual(SELECTED_TAB, DEFAULT_TAB);
      }
    }
  };
}
export function insertNodeInbetween(_callback, graph) {
  return function(currentNode, value) {
    graph = graph || GetCurrentGraph(GetState());
    let me = this;
    let link = GetLinkBetween(currentNode.id, value, graph);
    if (link) {
      var source = GetNodeById(link.source);
      var target = GetNodeById(link.target);

      this.props.graphOperation(REMOVE_LINK_BETWEEN_NODES, {
        ...link
      });

      let groupParent = GetNodeProp(source, NodeProperties.GroupParent);

      this.props.graphOperation(ADD_NEW_NODE, {
        nodeType: NodeTypes.DataChain,
        parent: source.id,
        groupProperties: groupParent
          ? {
              id: groupParent
            }
          : {},
        linkProperties: { properties: { ...LinkProperties.DataChainLink } },
        properties: {
          [NodeProperties.ChainParent]: source.id
        },
        links: [
          {
            target: link.target,
            linkProperties: { properties: { ...LinkProperties.DataChainLink } }
          }
        ],
        callback: node => {
          setTimeout(() => {
            me.props.graphOperation([
              {
                operation: ADD_LINK_BETWEEN_NODES,
                options: {
                  source: link.source,
                  target: node.id,
                  properties: { ...LinkProperties.DataChainLink }
                }
              },
              {
                operation: CHANGE_NODE_PROPERTY,
                options: {
                  id: link.target,
                  value: node.id,
                  prop: NodeProperties.ChainParent
                }
              }
            ]);
            if (_callback) {
              _callback(node.id);
            }
          }, 100);
        }
      });
    }
  };
}
export function InsertNodeInbetween(
  currentNode,
  value,
  graph,
  onCallback,
  properties = {}
) {
  graph = graph || GetCurrentGraph(GetState());
  let me = this;
  let link = GetLinkBetween(currentNode.id, value, graph);
  let result = [];
  if (link) {
    var source = GetNodeById(link.source, graph);
    var target = GetNodeById(link.target, graph);

    result.push({
      operation: REMOVE_LINK_BETWEEN_NODES,
      options: {
        ...link
      }
    });

    let groupParent = GetNodeProp(source, NodeProperties.GroupParent);
    let targetNode;
    result.push(
      {
        operation: ADD_NEW_NODE,
        options: function() {
          return {
            nodeType: NodeTypes.DataChain,
            parent: source.id,
            groupProperties: groupParent
              ? {
                  id: groupParent
                }
              : {},
            linkProperties: { properties: { ...LinkProperties.DataChainLink } },
            properties: {
              ...properties,
              [NodeProperties.ChainParent]: source.id
            },
            links: [
              {
                target: link.target,
                linkProperties: {
                  properties: { ...LinkProperties.DataChainLink }
                }
              }
            ],
            callback: node => {
              targetNode = node;
              if (onCallback) {
                onCallback(targetNode);
              }
            }
          };
        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function() {
          return {
            source: link.source,
            target: targetNode.id,
            properties: { ...LinkProperties.DataChainLink }
          };
        }
      },
      {
        operation: CHANGE_NODE_PROPERTY,
        options: function() {
          return {
            id: link.target,
            value: targetNode.id,
            prop: NodeProperties.ChainParent
          };
        }
      }
    );
  }
  return result;
}
export function connectChain() {
  return function(currentNode, value) {
    var id = currentNode.id;
    this.props.graphOperation(ConnectChainCommand(id, value));
  };
}
export function ConnectChainCommand(source, target) {
  return [
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: {
        source,
        target,
        properties: { ...LinkProperties.DataChainLink }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: {
        id: target,
        prop: NodeProperties.ChainParent,
        value: source
      }
    }
  ];
}

export function AddChainCommand(
  currentNode,
  callback,
  graph,
  viewPackage = {}
) {
  let groupProperties = GetNodeProp(currentNode, NodeProperties.GroupParent)
    ? {
        id: getGroup(
          GetNodeProp(currentNode, NodeProperties.GroupParent),
          graph
        ).id
      }
    : null;
  return {
    operation: ADD_NEW_NODE,
    options: {
      parent: currentNode.id,
      nodeType: NodeTypes.DataChain,
      groupProperties,
      properties: {
        ...viewPackage,
        [NodeProperties.Pinned]: false,
        [NodeProperties.ChainParent]: currentNode.id
      },
      linkProperties: {
        properties: { ...LinkProperties.DataChainLink }
      },
      callback
    }
  };
}
export function SplitDataCommand(
  currentNode,
  callback,
  viewPackage = {},
  graph,
  links = []
) {
  return {
    operation: ADD_NEW_NODE,
    options: {
      parent: currentNode.id,
      nodeType: NodeTypes.DataChain,
      groupProperties: {
        [GroupProperties.ExternalEntryNode]: GetNodeProp(
          currentNode,
          NodeProperties.ChainParent,
          graph
        ),
        [GroupProperties.GroupEntryNode]: currentNode.id,
        [GroupProperties.GroupExitNode]: currentNode.id,
        [GroupProperties.ExternalExitNode]: GetDataChainNextId(
          currentNode.id,
          graph
        )
      },
      properties: {
        [NodeProperties.Pinned]: false,
        ...viewPackage,
        [NodeProperties.ChainParent]: currentNode.id
      },
      linkProperties: {
        properties: { ...LinkProperties.DataChainLink }
      },
      links,
      callback
    }
  };
}
export const DataChainContextMethods = {
  Input1: connectNodeChain(NodeProperties.ChainNodeInput1),
  List: connectNodeChain(NodeProperties.List),
  Selector: connectNodeChain(NodeProperties.Selector),
  Screen: connectNodeChain(NodeProperties.Screen, true),
  SelectorProperty: connectNodeChain(NodeProperties.SelectorProperty),
  Value: connectNodeChain(NodeProperties.Value),
  StandardLink: connectChain(),
  InsertDataChain: insertNodeInbetween(),
  SnipDataChain: snipNodeFromInbetween(),
  SplitDataChain: function(currentNode) {
    let id = currentNode.id;
    let { state } = this.props;
    this.props.graphOperation([SplitDataCommand(currentNode)]);
  }
};
