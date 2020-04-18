/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { isBuffer } from "util";
import * as Titles from "../components/titles";
import {
  NodeTypes,
  NodeTypeColors,
  NodeProperties,
  NodePropertiesDirtyChain,
  DIRTY_PROP_EXT,
  LinkProperties,
  LinkType,
  LinkPropertyKeys,
  NodePropertyTypes,
  GroupProperties,
  FunctionGroups,
  LinkEvents
} from "../constants/nodetypes";
import {
  FunctionTemplateKeys,
  FunctionConstraintKeys,
  FUNCTION_REQUIREMENT_KEYS,
  INTERNAL_TEMPLATE_REQUIREMENTS
} from "../constants/functiontypes";
import * as Functions from "../constants/functiontypes";
import {
  GetNodeProp,
  GetLinkProperty,
  GetNodeTitle,
  GetGroupProperty,
  GetCurrentGraph,
  GetRootGraph,
  GetNodeById,
  GetNodes,
  GetNodeByProperties
} from "../actions/uiactions";
import { uuidv4 } from "../utils/array";

const os = require("os");

export function createGraph() {
  return {
    id: uuidv4(),
    version: {
      major: 0,
      minor: 0,
      build: 0
    },
    workspace: "",
    title: Titles.DefaultGraphTitle,
    path: [],
    namespace: "",
    // Groups
    groups: [],
    groupLib: {},
    groupsNodes: {}, // group => { node}
    nodesGroups: {}, // node => {group}
    childGroups: {}, // group => {group}
    parentGroup: {}, // group => {group}
    // Groups
    // Reference nodes
    referenceNodes: {},
    // Reference nodes
    nodeLib: {},
    nodes: [],
    nodeLinks: {}, // A library of nodes, and each nodes that it connects.
    nodeConnections: {}, // A library of nodes, and each nodes links
    nodeLinkIds: {},
    linkLib: {},
    links: [],
    graphs: {},
    classNodes: {},
    functionNodes: {}, // A function nodes will be run through for checking constraints.
    updated: null,
    visibleNodes: {}, // Nodes that are visible now, and used to calculate the visibility of other nodes.
    appConfig: {
      Logging: {
        IncludeScopes: false,
        LogLevel: {
          Default: "Debug",
          System: "Information",
          Microsoft: "Information"
        }
      },
      AppSettings: {
        "Local-AuthorizationKey":
          "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
        "Local-EndPointUrl": "https://localhost:8081",
        use_local: true,
        "DeveloperMode": true,
        EndPointUrl: "",
        AuthorizationKey: "",
        DatabaseId: "red-db-001",
        "AllowedOrigins": "http://localhost:44338",
        AssemblyPrefixes: "Smash;RedQuick",
        "Use-SingleCollection": true,
        "storage-key": "UseDevelopmentStorage=true",
        "single-thread": true,
        ConfirmEmailController: "Account",
        ConfirmEmailAction: "ConfirmEmail",
        HomeAction: "Index",
        HomeController: "Home",
        ResetPasswordAction: "ResetPassword",
        ResetPasswordController: "Account",
        Domain: "localhost:44338",
        SecurityKey: "ajskdflajsdfklas20klasdkfj9laksdjfl4aksdjf3kanvdlnaekf",
        AppSecret:
          "YQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcwB0AHUAdgB3AHgAeQB6ADAAMQAyADMANAA1AA==",
        Domain: "https://localhost:44338",
        TokenExpirationInMinutes: "250",
        Issuer: "https://localhost:44338",
        Audience: "https://localhost:44338",
        DomainPort: "44338"
      }
    }
  };
}
export const GraphKeys = {
  NAMESPACE: "namespace",
  PROJECTNAME: "project_name",
  COLORSCHEME: "color_scheme",
  SERVER_SIDE_SETUP: "server_side_setup",
  THEME: "theme"
};
export function updateWorkSpace(graph, options) {
  const { workspace } = options;

  graph.workspaces = graph.workspaces || {};
  graph.workspaces[os.platform()] = workspace;
  if (graph.workspaces[os.platform()]) {
    graph.workspace = workspace;
  }
  return graph;
}

export function CreateLayout() {
  return {
    layout: {},
    properties: {}
  };
}
export function FindLayoutRoot(id, root) {
  if (root && root[id]) {
    return root[id];
  }
  let res;
  Object.keys(root).find(t => {
    if (root[t]) res = FindLayoutRoot(id, root[t]);
    else {
      return false;
    }
    return res;
  });
  return res;
}

export function FindLayoutRootParent(id, root, parent) {
  if (root[id]) {
    return root || parent;
  }
  let res;
  Object.keys(root).find(t => {
    res = FindLayoutRootParent(id, root[t], root);
    return res;
  });
  return res;
}

export function GetAllChildren(root) {
  let result = Object.keys(root || {});
  result.map(t => {
    const temp = GetAllChildren(root[t]);
    result = [...result, ...temp];
  });
  return result;
}
export const DefaultCellProperties = {
  style: {
    borderStyle: "solid",
    borderWidth: 1
  },
  children: {}
};
export function GetCellProperties(setup, id) {
  const { properties } = setup;
  return properties[id];
}
export function RemoveCellLayout(setup, id) {
  if (setup && setup.layout) {
    const parent = FindLayoutRootParent(id, setup.layout);
    if (parent) {
      const kids = GetAllChildren(parent[id]);
      kids.map(t => {
        delete setup.properties[t];
      });

      delete parent[id];
      delete setup.properties[id];
    }
  }
  return setup;
}
export function ReorderCellLayout(setup, id, dir = -1) {
  if (setup && setup.layout) {
    const parent = FindLayoutRootParent(id, setup.layout);
    if (parent) {
      const layout = parent;
      const keys = Object.keys(layout);
      if (keys.some(v => v === id)) {
        const id_index = keys.indexOf(id);
        if (id_index === 0 && dir === -1) {
          // do nothing
        }
        else if (id_index === keys.length - 1 && dir === 1) {
          // keep doing nothing
        }
        else {
          const temp = keys[id_index];
          keys[id_index] = keys[id_index + dir];
          keys[id_index + dir] = temp;
        }

        const temp_layout = { ...layout };
        keys.map(k => delete layout[k]);
        keys.map(k => (layout[k] = temp_layout[k]));
      }
    }
  }
  return setup;
}

export function GetChildren(setup, parentId) {
  const parent = FindLayoutRootParent(parentId, setup.layout);

  return Object.keys(parent[parentId]);
}
export function GetChild(setup, parentId) {
  if (setup && setup.properties && setup.properties[parentId] && setup.properties[parentId].children) {
    return setup.properties[parentId].children[parentId];
  }
  return null;
}
export function GetFirstCell(setup) {
  const keys = setup ? Object.keys(setup.layout) : [];

  return keys[0] || null;
}
export function SetCellsLayout(
  setup,
  count,
  id,
  properties = DefaultCellProperties
) {
  let keys = [];
  let root = null;
  count = parseInt(count);
  if (!id) {
    keys = Object.keys(setup.layout);
    root = setup.layout;
  } else {
    root = FindLayoutRoot(id, setup.layout);
    if (!root) {
      throw "missing root";
    }
    keys = Object.keys(root);
  }
  // If there is room add keys
  if (keys.length - count < 0) {
    [].interpolate(0, count - keys.length, () => {
      const newkey = uuidv4();
      root[newkey] = {};
      setup.properties[newkey] = { ...JSON.parse(JSON.stringify(properties)) };
    });
  } else if (keys.length - count > 0) {
    [].interpolate(0, keys.length - count, index => {
      delete root[keys[index]];
      delete setup.properties[keys[index]];
    });
  }

  return setup;
}
export function SortCells(setup, parentId, sortFunction) {

  const layout = FindLayoutRoot(parentId, setup.layout);
  const keys = Object.keys(layout);
  const temp_layout = { ...layout };
  keys.forEach(k => delete layout[k]);
  keys.sort(sortFunction).forEach(k => {
    layout[k] = temp_layout[k];
  });

}
export function GetCellIdByTag(setup, tag) {
  if (setup && setup.properties) {
    return Object.keys(setup.properties).find(v => {
      const { properties } = setup.properties[v];
      if (properties && properties.tags) {
        return properties.tags.indexOf(tag) !== -1;
      }
      return false;
    })
  }

  return null;
}

export function incrementBuild(graph) {
  graph.version.build++;
  return graph;
}

export function incrementMinor(graph) {
  graph.version.minor++;
  graph.version.build = 0;
  return graph;
}

export function incrementMajor(graph) {
  graph.version.major++;
  graph.version.minor = 0;
  graph.version.build = 0;
  return graph;
}

export function updateGraphTitle(graph, ops) {
  const { text } = ops;
  graph.title = text;
  return graph;
}

export function createScreenParameter(parameter) {
  return {
    title: parameter || "",
    id: uuidv4()
  };
}
export function GetParameterName(parameter) {
  if (parameter) return parameter.title || "";
  return "";
}

export function updateGraphProperty(graph, ops) {
  const { prop, value } = ops;
  graph[prop] = value;
  return graph;
}

export function addNewSubGraph(graph) {
  const newgraph = createGraph();
  newgraph.title = Titles.DefaultSubGraphTitle;
  graph.graphs[newgraph.id] = newgraph;
  return graph;
}
export function removeSubGraph(graph, id) {
  delete graph.graphs[id];
  return graph;
}

export function getSubGraphs(graph) {
  return graph && graph.graphs
    ? Object.keys(graph.graphs || {}).map(t => graph.graphs[t])
    : [];
}

export function getSubGraph(graph, scopes) {
  let result = graph;

  scopes.map(scope => {
    result = graph.graphs[scope];
  });

  return result;
}
export function getScopedGraph(graph, options) {
  const { scope } = options;
  if (scope && scope.length) {
    console.log(scope);
    scope.map((s, i) => {
      graph = graph.graphs[s];
    });
  }
  return graph;
}

export function setScopedGraph(root, options) {
  const { scope, graph } = options;
  if (scope && scope.length) {
    let currentGraph = root;
    scope.map((s, i) => {
      if (i === scope.length - 1) {
        currentGraph.graphs[s] = graph;
      } else {
        currentGraph = currentGraph.graphs[s];
      }
    });
  } else {
    root = graph;
  }
  return root;
}

export function newGroup(graph, callback) {
  const group = createGroup();
  const result = addGroup(graph, group);
  if (callback) {
    callback(group);
  }
  return result;
}
export function GetNodesInGroup(graph, group) {
  return (
    (graph.groupsNodes &&
      graph.groupsNodes[group] &&
      Object.keys(graph.groupsNodes[group]).filter(
        v => graph.groupsNodes[group][v]
      )) ||
    []
  );
}
export function addLeaf(graph, ops) {
  const { leaf, id } = ops;
  let leaves = graph.groupLib[id].leaves || [];
  if (fast) {
    if (leaves.indexOf(leaf) === -1) {
      leaves.push(leaf);
    }
  }
  else {
    leaves = [...leaves, leaf].unique(x => x);
  }
  // Groups => nodes
  graph.groupsNodes[id] = graph.groupsNodes[id] || {};
  graph.groupsNodes[id][leaf] = true;
  if (!fast) {
    graph.groupsNodes = {
      ...graph.groupsNodes
    };
  }

  // Nodes => groups
  graph.nodesGroups[leaf] = graph.nodesGroups[leaf] || {};
  graph.nodesGroups[leaf][id] = true;
  if (!fast) {
    graph.nodesGroups = {
      ...graph.nodesGroups
    };
  }

  graph.groupLib[id].leaves = leaves;
  return graph;
}
export function removeLeaf(graph, ops) {
  const { leaf, id } = ops;
  const group = graph.groupLib[id];
  if (group) {
    let leaves = group.leaves || [];
    leaves = leaves.filter(t => t !== leaf);
    graph.groupLib[id].leaves = leaves;
  }
  if (graph.groupsNodes[id]) {
    if (graph.groupsNodes[id][leaf]) {
      delete graph.groupsNodes[id][leaf];
    }
    if (Object.keys(graph.groupsNodes[id]).length === 0) {
      delete graph.groupsNodes[id];
      graph.groups = graph.groups.filter(x => x !== id);
      delete graph.groupLib[id];
    }
    if (!fast) {
      graph.groupsNodes = {
        ...graph.groupsNodes
      };
    }
  }

  if (graph.nodesGroups[leaf]) {
    if (graph.nodesGroups[leaf][id]) {
      delete graph.nodesGroups[leaf][id];
    }
    if (Object.keys(graph.nodesGroups[leaf]).length === 0) {
      delete graph.nodesGroups[leaf];
    }
    if (!fast) {
      graph.nodesGroups = {
        ...graph.nodesGroups
      };
    }
  }

  return graph;
}

export function addGroupToGroup(graph, ops) {
  const { groupId, id } = ops;
  const group = graph.groupLib[id];
  const groups = group.groups || [];
  if (fast) {
    if (group.groups.indexOf(groupId) === -1) {
      group.groups.push(groupId);
    }
  }
  else {
    group.groups = [...groups, groupId].unique(x => x);
  }
  graph.groupLib[id] = group;
  if (!fast) {
    graph.groupLib = { ...graph.groupLib };
  }
  // Groups need to know who contains them,
  graph.childGroups[id] = graph.childGroups[id] || {};
  graph.childGroups[id][groupId] = true;
  // and also the containers to know about the groups
  graph.parentGroup[groupId] = graph.parentGroup[groupId] || {};
  graph.parentGroup[groupId][id] = true;

  return graph;
}
export function removeGroupFromGroup(graph, ops) {
  const { groupId, id } = ops;
  const group = graph.groupLib[id];

  if (group && group.groups) {
    group.groups = group.groups.filter(x => x !== groupId);
  }
  if (!fast) {
    graph.groupLib[id] = { ...group };
  }
  if (graph.childGroups) {
    if (graph.childGroups[id]) {
      delete graph.childGroups[id][groupId];
      if (!Object.keys(graph.childGroups[id]).length) {
        delete graph.childGroups[id];
      }
    }

    if (graph.parentGroup[groupId]) {
      delete graph.parentGroup[groupId][id];
      if (!Object.keys(graph.parentGroup[groupId]).length) {
        delete graph.childGroups[groupId];
      }
    }
  }

  return graph;
}

export function getNodesGroups(graph, id) {
  return graph && graph.nodesGroups ? graph.nodesGroups[id] : null;
}
export function clearGroup(graph, ops) {
  const { id } = ops;
  for (const i in graph.groupsNodes[id]) {
    if (graph.nodesGroups[i]) {
      delete graph.nodesGroups[i][id];
      if (Object.keys(graph.nodesGroups[i]).length === 0) {
        delete graph.nodesGroups[i];
      }
    }
  }
  for (const i in graph.childGroups[id]) {
    if (graph.parentGroup[i]) {
      delete graph.parentGroup[i][id];
      if (Object.keys(graph.parentGroup[i]).length === 0) {
        delete graph.parentGroup[i];
      }
    }
  }
  graph.groups = [...graph.groups.filter(x => x !== id)];
  delete graph.groupLib[id];
  delete graph.childGroups[id];
  delete graph.groupsNodes[id];

  return graph;
}
export function createValidator() {
  return {
    properties: {}
  };
}

export function createMethodValidation(methodType) {
  const res = {
    methods: {}
  };

  if (res && !res.methods[methodType]) {
    res.methods[methodType] = createMethodValidationType();
  }

  return res;
}

export function createMethodValidationType() {
  return {};
}
export function getMethodValidationType(methodValidation, methodType) {
  const { methods } = methodValidation;
  if (methods && methods[methodType]) {
    return methods[methodType];
  }
  return null;
}
export function addMethodValidationForParamter(
  methodValidation,
  methodType,
  methodParam,
  methedParamProperty
) {
  methodValidation = methodValidation || createMethodValidation(methodType);
  if (getMethodValidationType(methodValidation, methodType)) {
    const methodValidationType = getMethodValidationType(
      methodValidation,
      methodType
    );
    if (methodParam) {
      methodValidationType[methodParam] =
        methodValidationType[methodParam] || createProperyContainer();
      if (methedParamProperty && methodValidationType[methodParam]) {
        methodValidationType[methodParam].properties[methedParamProperty] =
          methodValidationType[methodParam].properties[methedParamProperty] ||
          createValidatorProperty();
      }
    }
  }
  return methodValidation;
}
export function createProperyContainer() {
  return {
    properties: {}
  };
}
export function getMethodValidationForParameter(
  methodValidation,
  methodType,
  methodParam,
  methodProperty
) {
  methodValidation =
    methodValidation ||
    addMethodValidationForParamter(methodValidation, methodType, methodParam);
  if (methodValidation) {
    const temp = getMethodValidationType(methodValidation, methodType);
    if (!temp) {
      methodValidation.methods[methodType] = createMethodValidation(
        methodType
      ).methods[methodType];
    }
    if (temp) {
      if (temp[methodParam] && temp[methodParam]) {
        return temp[methodParam];
      }
    }
  }
  return null;
}
export function removeMethodValidationParameter(
  methodValidation,
  methodType,
  methodParam,
  methedParamProperty
) {
  if (methodValidation) {
    const temp = getMethodValidationType(methodValidation, methodType);
    if (temp) {
      if (
        temp[methodParam] &&
        temp[methodParam].properties &&
        temp[methodParam].properties[methedParamProperty]
      ) {
        delete temp[methodParam].properties[methedParamProperty];
      }
    }
  }
  return methodValidation;
}
export const createExecutor = createValidator;

export function createValidatorProperty() {
  return {
    validators: {}
  };
}
export function hasValidator(validator, options) {
  if (validator && validator.properties && validator.properties[options.id]) {
    if (options.validator && validator.properties[options.id].validators) {
      const { validators } = validator.properties[options.id];
      return Object.keys(validators).some(id => validators[id].type === options.validatorArgs.type)
    }
  }

  return false;

}
export function addValidatator(validator, options) {
  validator.properties[options.id] =
    validator.properties[options.id] || createValidatorProperty();
  if (options.validator)
    validator.properties[options.id].validators[options.validator] =
      options.validatorArgs;

  return validator;
}
export function removeValidatorValidation(_validator, options) {
  const { property, validator } = options;
  delete _validator.properties[property].validators[validator];

  return _validator;
}
export function removeValidator(validator, options) {
  delete validator.properties[options.id];
  return validator;
}

export function getValidatorItem(item, options) {
  const { property, validator } = options;
  return item.properties[property].validators[validator];
}

export function getValidatorProperties(validator) {
  return validator ? validator.properties : null;
}
export function setDepth(graph, options) {
  const { depth } = options;
  graph.depth = depth;

  return graph;
}
export function newNode(graph, options) {
  const node = createNode();
  if (_viewPackageStamp) {
    for (const p in _viewPackageStamp) {
      node.properties[p] = _viewPackageStamp[p];
    }
  }

  return addNode(graph, node, options);
}

export function createExtensionDefinition() {
  return {
    // The code generation will define the unique 'value'.
    config: {
      // If this definition is a list or some sort of collection.
      isEnumeration: false,
      // If not, then it is a dictionary, and will have some sort of property that will  be considered the value.
      dictionary: {},
      // A list of objects, with the same shape as the dictionary.
      list: []
    },
    definition: {}
  };
}
export function defaultExtensionDefinitionType() {
  return "string";
}
export function MatchesProperties(properties, node) {
  if (properties && node) {
    const res = !Object.keys(properties).some(key => properties[key] !== GetNodeProp(node, key));

    return res;
  }
  return false;
}
export function removeNode(graph, options = {}) {
  const { id } = options;
  const idsToDelete = [id];
  const autoDelete = GetNodeProp(id, NodeProperties.AutoDelete, graph);
  if (autoDelete) {
    GetNodesLinkedTo(graph, { id })
      .filter(x => MatchesProperties(autoDelete.properties, x))
      .forEach(t => {
        idsToDelete.push(t.id);
      });
  }

  idsToDelete.forEach(id => {
    const existNodes = getNodesByLinkType(graph, {
      exist: true,
      id,
      direction: TARGET,
      type: LinkType.Exist
    });
    updateCache({
      prop: NodeProperties.NODEType,
      id,
      previous: GetNodeProp(id, NodeProperties.NODEType, graph)
    });

    graph = incrementBuild(graph);
    // links
    graph = clearLinks(graph, options);

    // groups
    graph = removeNodeFromGroups(graph, options);

    if (graph.functionNodes && graph.functionNodes[id]) {
      delete graph.functionNodes[id];
      graph.functionNodes = { ...graph.functionNodes };
    }
    if (graph.classNodes && graph.classNodes[id]) {
      delete graph.classNodes[id];
      graph.classNodes = { ...graph.classNodes };
    }
    delete graph.nodeLib[id];
    graph.nodeLib = { ...graph.nodeLib };
    graph.nodes = graph.nodes.filter(x => x !== id);
    if (existNodes) {
      existNodes.map(en => {
        graph = removeNode(graph, { id: en.id });
      });
    }
  });
  return graph;
}

export function GetManyToManyNodes(state, ids) {
  if (state && ids && ids.length) {
    return NodesByType(state, NodeTypes.Model)
      .filter(x => GetNodeProp(x, NodeProperties.ManyToManyNexus))
      .filter(x => !(ids || []).some(t => (
        (GetNodeProp(x, NodeProperties.ManyToManyNexusTypes) || []).indexOf(
          t
        ) !== -1
      )));
  }
  return [];
}
export function getPropertyNodes(graph, id) {
  return getNodesByLinkType(graph, {
    id,
    direction: SOURCE,
    type: LinkType.PropertyLink
  });
}
export function getDataChainNodes(graph, id) {
  return getNodesByLinkType(graph, {
    id,
    direction: TARGET,
    type: LinkType.DataChainLink
  });
}
function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0;
}
function clearGroupDeep(graph, options) {
  const { id, callback } = options;
  let success = true;
  if (graph.childGroups[id]) {
    for (var i in graph.childGroups[id]) {
      var ok = false;
      graph = clearGroupDeep(graph, {
        id: i,
        callback: v => {
          ok = v;
          success = success && v;
        }
      });
      if (graph.childGroups[id]) {
        delete graph.childGroups[id][i];
      }
    }
  }
  if (success) {
    // If the children were empty this can be cleared out
    if (
      !graph.groupLib[id] ||
      !graph.groupLib[id].leaves ||
      !graph.groupLib[id].leaves.length
    ) {
      if (
        !graph.groupLib[id] ||
        !graph.groupLib[id].groups ||
        !graph.groupLib[id].groups.length
      ) {
        // if these conditions are met.
        delete graph.groupLib[id];
        graph.groups = [...graph.groups.filter(x => x !== id)];
        delete graph.childGroups[id];
        if (graph.parentGroup[id]) {
          for (var i in graph.parentGroup[id]) {
            graph = removeGroupFromGroup(graph, { groupId: id, id: i });
            graph = clearGroupDeep(graph, { id: i });
            if (graph.childGroups[i]) delete graph.childGroups[i][id];
          }
          delete graph.parentGroup[id];
        }
      }
    }
  } else if (callback) {
    callback(false);
  }
  return graph;
}
export function removeNodeFromGroups(graph, options) {
  const { id } = options;
  let groupsContainingNode = [];
  // nodesGroups
  if (graph.nodesGroups[id]) {
    groupsContainingNode = Object.keys(graph.nodesGroups[id]);
    groupsContainingNode.map(group => {
      graph = removeLeaf(graph, { leaf: id, id: group });
    });
  }

  // groupsNodes
  if (graph.groupsNodes) {
    groupsContainingNode.map(group => {
      if (graph.groupsNodes[group]) {
        if (graph.groupsNodes[group][id]) {
          delete graph.groupsNodes[group][id];
        }

        if (Object.keys(graph.groupsNodes[group]).length === 0) {
          delete graph.groupsNodes[group];
        }
      }
      graph = clearGroupDeep(graph, { id: group });
    });
  }

  return graph;
}
export function clearLinks(graph, options) {
  const { id } = options;
  const linksToRemove = getAllLinksWithNode(graph, id);
  for (let i = 0; i < linksToRemove.length; i++) {
    const link = linksToRemove[i];
    graph = removeLink(graph, link);
  }
  return graph;
}

export function addNode(graph, node, options) {
  graph.nodeLib[node.id] = node;
  // graph.nodeLib = { ...graph.nodeLib };
  // graph.nodes = [...graph.nodes, node.id];
  graph.nodes.push(node.id);
  // graph = { ...graph };
  graph = incrementBuild(graph);
  if (options && options.callback) {
    options.callback(node);
  }
  return graph;
}
const AppCache = {
  Links: {},
  Nodes: {},
  Pinned: {},
  Selected: {},
  ViewPackages: {},
  Version: 0,
  Paused: false,
  Properties: {},
  PropertyKeys: []
};
export function GetAppCache() {
  return AppCache;
}
export function GetAppCacheVersion() {
  return AppCache.Version;
}
export function Paused() {
  return AppCache.Paused;
}
export function SetPause(value = true) {
  AppCache.Paused = value;
}
export function setupCache(graph) {
  AppCache.Links = {};
  AppCache.Nodes = {};
  AppCache.Pinned = {};
  AppCache.Selected = {};
  AppCache.ViewPackages = {};
  AppCache.Properties = {};
  AppCache.PropertyKeys = [];
  AppCache.Version = 0;
  const { Nodes, Links, Pinned, Selected, ViewPackages } = AppCache;

  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }

  if (graph && graph.nodeLib) {

    Object.keys(graph.nodeLib).forEach(key => {
      const node = GetNode(graph, key);
      const nodeType = GetNodeProp(node, NodeProperties.NODEType);
      Nodes[nodeType] = Nodes[nodeType] || {};
      Nodes[nodeType][key] = true;
      const selected = GetNodeProp(node, NodeProperties.Selected);
      if (selected) {
        Selected[key] = true;
      }
      const pinned = GetNodeProp(node, NodeProperties.Pinned);
      if (pinned) {
        Pinned[key] = true;
      }
      const vp = GetNodeProp(node, NodeProperties.ViewPackage);
      if (vp) {
        if (!ViewPackages[vp]) {
          ViewPackages[vp] = {
            [node.id]: true
          };
        }
        else {
          ViewPackages[vp][node.id] = true;
        }
      }
      if (AppCache.Properties) {
        const { properties } = node;
        if (properties) {
          Object.keys(properties).forEach(prop => {
            const propValue = GetNodeProp(node, prop);
            AppCache.Properties[prop] = AppCache.Properties[prop] || {};
            AppCache.Properties[prop][propValue] = AppCache.Properties[prop][GetNodeProp(node, prop)] || {};
            AppCache.Properties[prop][propValue][node.id] = true;
          });
        }
      }
      AppCache.Version++;
    })
    recyclePropertyKeys();
  }
  if (graph && graph.linkLib) {
    const addNodeLinkIds = !graph.nodeLinkIds || !Object.keys(graph.nodeLinkIds).length;
    if (addNodeLinkIds) {
      graph.nodeLinkIds = {}
    }
    Object.keys(graph.linkLib).forEach(key => {
      const linkType = GetLinkProperty(getLink(graph, { id: key }), LinkPropertyKeys.TYPE);
      if (linkType) {
        Links[linkType] = Nodes[linkType] || {};
        Links[linkType][key] = true;
        AppCache.Version++;
      }
      const { source, target } = graph.linkLib[key];
      graph.nodeLinkIds[source] = graph.nodeLinkIds[source] || {};
      graph.nodeLinkIds[source][target] = key;
    });

  }
}
function recyclePropertyKeys() {
  AppCache.PropertyKeys = Object.keys(AppCache.Properties).sort((a, b) => {
    return Object.keys(AppCache.Properties[a]).length - Object.keys(AppCache.Properties[b]).length;
  });
}
const runtimeState = {
  lastLropertyKeyRecycle: 0,
  recycleEveryProperty: 300
};

export function GetNodesByProperties(props, graph) {
  const orderedLookupProp = Object.keys(props).sort((a, b) => {
    return AppCache.PropertyKeys.indexOf(a) - AppCache.PropertyKeys.indexOf(b);
  });
  if (runtimeState.lastLropertyKeyRecycle > runtimeState.recycleEveryProperty) {
    recyclePropertyKeys();
    runtimeState.lastLropertyKeyRecycle = 0;
  }

  runtimeState.lastLropertyKeyRecycle++;

  let subset = null;
  orderedLookupProp.forEach(key => {
    if (subset && subset.length === 0) {
      return;
    }
    const val = props[key];
    let set;
    if (typeof val === 'function') {
      set = {};
      if (AppCache.Properties[key]) {
        Object.keys(AppCache.Properties[key]).filter(tempVal => val(tempVal)).forEach(tempVal => {
          set = Object.assign(set, AppCache.Properties[key][tempVal]);
        });
      }
    }
    else if (AppCache.Properties[key] && AppCache.Properties[key][val]) {
      set = {};
      set = Object.assign(set, AppCache.Properties[key][val]);
    }
    else {
      set = {};
    }
    if (!subset && set) {
      subset = set;
    }
    else if (subset && set) {
      const newset = {};
      const setToUse = Object.keys(subset).length > Object.keys(set).length ? set : subset;
      Object.keys(setToUse).forEach(setKey => {
        if (set.hasOwnProperty(setKey) && subset.hasOwnProperty(setKey)) {
          newset[setKey] = true;
        }
      })
      subset = newset;
    }
  })
  if (!subset) {
    return [];
  }
  return Object.keys(subset).map(item => graph.nodeLib[item]).filter(x => x);
}
export function removeCacheLink(id, type) {
  if (AppCache.Links && AppCache.Links[type] && AppCache.Links[type][id]) {
    delete AppCache.Links[type][id];
    AppCache.Version++;
  }
}
export function updateCache(options, link) {
  const { previous, value, id, prop } = options;
  if (link) {
    if (AppCache.Links && link.properties) {
      AppCache.Links[link.properties.type] = AppCache.Links[link.properties.type] || {};
      AppCache.Links[link.properties.type][id] = true;
    }
    AppCache.Version++;
  }
  else if (AppCache.Nodes) {
    if (!AppCache.Properties[prop]) {
      AppCache.Properties[prop] = {};
    }
    if (previous) {
      if (!AppCache.Properties[prop][previous]) {
        AppCache.Properties[prop][previous] = {};
      }
      AppCache.Properties[prop][previous][id] = false;
    }

    if (value !== undefined) {
      if (!AppCache.Properties[prop][value]) {
        AppCache.Properties[prop][value] = {};
      }
      AppCache.Properties[prop][value][id] = true;
    }

    switch (prop) {
      case NodeProperties.NODEType:
        if (previous) {
          if (AppCache.Nodes[previous]) {
            delete AppCache.Nodes[previous][id];
          }
        }
        if (value) {
          AppCache.Nodes[value] = AppCache.Nodes[value] || {};
          AppCache.Nodes[value][id] = false;
        }
        AppCache.Version++;
        break;
      case NodeProperties.ViewPackage:
        if (previous) {
          if (AppCache.ViewPackages[previous]) {
            delete AppCache.ViewPackages[previous][id];
          }
        }
        if (value) {
          AppCache.ViewPackages[value] = AppCache.ViewPackages[value] || {};
          AppCache.ViewPackages[value][id] = false;
        }
        AppCache.Version++;
        break;
      case NodeProperties.Pinned:
        if (value) {
          AppCache.Pinned[id] = true;
        }
        else {
          delete AppCache.Pinned[id];
        }
        AppCache.Version++;
        break;
      case NodeProperties.Selected:
        if (value) {
          AppCache.Pinned[id] = true;
        }
        else {
          delete AppCache.Pinned[id];
        }
        AppCache.Version++;
        break;
      default: break;
    }
  }
}

export function addGroup(graph, group) {
  graph.groupLib[group.id] = group;
  if (!fast) {
    graph.groupLib = { ...graph.groupLib };
  }
  if (fast) {
    if (graph.groups.indexOf(group.id) === -1) {
      graph.groups.push(group.id);
    }
  }
  else {
    graph.groups = [...graph.groups, group.id].unique(x => x);
  }
  if (fast) {
    return graph
  }
  graph = { ...graph };
  return graph;
}

export function addNewPropertyNode(graph, options) {
  return addNewNodeOfType(graph, options, NodeTypes.Property);
}

const DEFAULT_PROPERTIES = [
  { title: "Owner", type: NodePropertyTypes.STRING },
  { title: "Id", type: NodePropertyTypes.STRING },
  { title: "Created", type: NodePropertyTypes.DATETIME },
  { title: "Updated", type: NodePropertyTypes.DATETIME },
  { title: "Deleted", type: NodePropertyTypes.BOOLEAN },
  { title: "Version", type: NodePropertyTypes.INT }
].map(t => {
  t.nodeType = NodeTypes.Property;
  return t;
});

export function addDefaultProperties(graph, options) {
  // updateNodeProperty
  const propertyNodes = GetLinkChainFromGraph(graph, {
    id: options.parent,
    links: [
      {
        direction: SOURCE,
        type: LinkType.PropertyLink
      }
    ]
  }).map(t => GetNodeProp(t, NodeProperties.UIText));
  DEFAULT_PROPERTIES.filter(t => propertyNodes.indexOf(t.title) === -1).map(dp => {
    graph = addNewNodeOfType(
      graph,
      options,
      dp.nodeType,
      (new_node, _graph) => {
        _graph = updateNodeProperty(_graph, {
          id: new_node.id,
          prop: NodeProperties.UIText,
          value: dp.title
        });
        _graph = updateNodeProperty(_graph, {
          id: new_node.id,
          prop: NodeProperties.IsDefaultProperty,
          value: true
        });
        _graph = updateNodeProperty(_graph, {
          id: new_node.id,
          prop: NodeProperties.UIAttributeType,
          value: dp.type
        });
        _graph = updateNodeProperty(_graph, {
          id: new_node.id,
          prop: NodeProperties.Pinned,
          value: false
        });
        return _graph;
      }
    );
  });

  return graph;
}

function updateNode(node, options) {
  if (options.node) {
    Object.apply(
      node.properties,
      JSON.parse(JSON.stringify(options.node.properties))
    );
  }
}
let _viewPackageStamp = null;
let _view_package_key = null;
export function setViewPackageStamp(viewPackageStamp, key) {
  if (!_viewPackageStamp || !viewPackageStamp)
    if (_view_package_key === key || !_view_package_key) {
      _viewPackageStamp = viewPackageStamp;
      _view_package_key = !_viewPackageStamp ? null : key;
    }
}
export function isStamped() {
  return !!_view_package_key;
}
export const Flags = {
  HIDE_NEW_NODES: 'HIDE_NEW_NODES'
};
const FunctionFlags = {};
const FunctionFlagKeys = {};
export function setFlag(hideNewNode, key, flag) {
  if (!FunctionFlags[flag] || !hideNewNode)
    if (FunctionFlagKeys[flag] === key || !FunctionFlagKeys[flag]) {
      FunctionFlags[flag] = hideNewNode;
      FunctionFlagKeys[flag] = !FunctionFlags[flag] ? null : key;
    }
}
export function isFlagged(flag) {
  return FunctionFlags[flag]
}

export function addNewNodeOfType(graph, options, nodeType, callback) {
  const { parent, linkProperties, groupProperties } = options;
  if (!callback) {
    callback = options.callback;
  }
  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    console.error(`${graph.links.length} !== ${Object.keys(graph.linkLib).length}`)
    throw new Error('invalid grid links');
  }
  const node = createNode(nodeType);
  if (options.node) {
    updateNode(node, options);
    if (nodeType === NodeTypes.ReferenceNode) {
      if (options.rootNode) {
        options.rootNode.referenceNodes[graph.id] = {
          ...(options.rootNode.referenceNodes[graph.id] || {}),
          ...{
            [node.id]: options.node.id
          }
        };
      }
    }
  }
  graph = addNode(graph, node);
  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }
  if (parent) {
    graph = newLink(graph, {
      source: parent,
      target: node.id,
      properties: linkProperties ? linkProperties.properties : null
    });
    if (graph.links.length !== Object.keys(graph.linkLib).length) {
      throw new Error('invalid grid links');
    }
  }
  if (options.links) {
    options.links.filter(x => x).map(link => {
      if (typeof link === "function") {
        link = link(graph);
        link = link.find(x => x);
      }
      if (graph.links.length !== Object.keys(graph.linkLib).length) {
        throw new Error('invalid grid links');
      }
      graph = newLink(graph, {
        source: node.id,
        target: link.target,
        properties: link.linkProperties ? link.linkProperties.properties : null
      });
    });
  }
  graph = updateNodeProperty(graph, {
    id: node.id,
    prop: NodeProperties.NODEType,
    value: nodeType
  });
  graph = updateNodeProperty(graph, {
    id: node.id,
    prop: NodeProperties.Pinned,
    value: true
  });
  if (isFlagged(Flags.HIDE_NEW_NODES)) {
    graph = updateNodeProperty(graph, {
      id: node.id,
      prop: NodeProperties.Pinned,
      value: false
    });
  }
  if (options.properties) {
    for (var p in options.properties) {
      graph = updateNodeProperty(graph, {
        id: node.id,
        prop: p,
        value: options.properties[p]
      });
    }
  }
  if (_viewPackageStamp) {
    for (var p in _viewPackageStamp) {
      graph = updateNodeProperty(graph, {
        id: node.id,
        prop: p,
        value: _viewPackageStamp[p]
      });
    }
  }
  let groupId = null;
  if (groupProperties) {
    graph = updateNodeGroup(graph, {
      id: node.id,
      groupProperties,
      parent,
      callback: _gid => {
        groupId = _gid;
      }
    });
  }
  if (callback) {
    graph = callback(GetNodeById(node.id, graph), graph, groupId) || graph;
  }

  return graph;
}

export function updateNodeGroup(graph, options) {
  const { id, groupProperties, parent, callback, groupCallback } = options;
  var group = null;
  if (groupProperties && groupProperties.id) {
    group = getGroup(graph, groupProperties.id);
  } else if (!hasGroup(graph, parent)) {
    var group = createGroup();
    graph = addGroup(graph, group);
    graph = updateNodeProperty(graph, {
      id: parent,
      value: { group: group.id },
      prop: NodeProperties.Groups
    });
    graph = addLeaf(graph, { leaf: parent, id: group.id });
    const grandParent = GetNodeProp(
      graph.nodeLib[parent],
      NodeProperties.GroupParent
    );
    if (grandParent && graph.groupLib[grandParent]) {
      const gparentGroup = graph.groupLib[grandParent];
      if (gparentGroup) {
        const ancestores = getGroupAncenstors(graph, gparentGroup.id);
        graph = addGroupToGroup(graph, {
          id: gparentGroup.id,
          groupId: group.id
        });
        ancestores.map(anc => {
          graph = addGroupToGroup(graph, {
            id: anc,
            groupId: group.id
          });
        });
      }
    }
  } else {
    const nodeGroupProp = GetNodeProp(
      graph.nodeLib[parent],
      NodeProperties.Groups
    );
    group = getGroup(graph, nodeGroupProp.group);
  }

  if (group) {
    graph = addLeaf(graph, { leaf: id, id: group.id });
    graph = updateNodeProperty(graph, {
      id,
      value: group.id,
      prop: NodeProperties.GroupParent
    });

    if (groupProperties) {
      for (const gp in groupProperties) {
        graph = updateGroupProperty(graph, {
          id: group.id,
          prop: gp,
          value: groupProperties[gp]
        });
      }
      if (callback) {
        callback(group.id);
      }
    }
    if (groupCallback && group) {
      groupCallback(group.id)
    }
  }

  return graph;
}
function getGroupAncenstors(graph, id) {
  const result = [];
  if (graph.parentGroup[id]) {
    for (const i in graph.parentGroup[id]) {
      result.push(...getGroupAncenstors(graph, i));
    }
  }
  return result;
}
export function getGroup(graph, id) {
  return graph.groupLib[id];
}
export function hasGroup(graph, parent) {
  return !!(
    graph.nodeLib[parent] &&
    GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups)
  );
}
export function GetNode(graph, id) {
  if (graph && graph.nodeLib) {
    return graph.nodeLib[id];
  }
  return null;
}

export function GetChildComponentAncestors(state, id) {
  const result = [];

  const graph = GetRootGraph(state);
  const ancestors = GetNodesLinkedTo(graph, {
    id,
    direction: TARGET
  })
    .filter(x => {
      const nodeType = GetNodeProp(x, NodeProperties.NODEType);
      switch (nodeType) {
        case NodeTypes.ScreenOption:
        case NodeTypes.ComponentNode:
          return true;
        default: return false;
      }
    })
    .map(t => t.id);

  result.push(...ancestors);
  ancestors.forEach(t => {
    const temp = GetChildComponentAncestors(state, t);
    result.push(...temp);
  });
  return result.unique();
}
export function createComponentProperties() {
  return {
    properties: {},
    instanceTypes: {}
  };
}
export function addComponentProperty(props, ops) {
  const { modelType, modelProp, instanceType } = ops;
  if (props && props.properties) {
    props.properties[modelProp] = modelType;
    props.instanceTypes[modelProp] = instanceType;
  }
  return props;
}
export function removeComponentProperty(props, ops) {
  const { modelProp } = ops;
  if (props && props.properties) {
    delete props.properties[modelProp];
    delete props.instanceTypes[modelProp];
  }
  return props;
}

export function updateClientMethod(methodParams, key, param, mparam, value) {
  methodParams[key] = methodParams[key] || {};
  methodParams[key].parameters = methodParams[key].parameters || {};
  methodParams[key].parameters[param] =
    methodParams[key].parameters[param] || {};
  if (fast) {
    methodParams[key].parameters[param][mparam] = value;
  }
  else {
    methodParams[key].parameters[param] = {
      ...methodParams[key].parameters[param],
      [mparam]: value
    };
  }

  return methodParams;
}

export function getClientMethod(methodParams, key, param, mparam) {
  if (
    methodParams &&
    methodParams[key] &&
    methodParams[key].parameters &&
    methodParams[key].parameters[param] &&
    methodParams[key].parameters[param][mparam]
  )
    return methodParams[key].parameters[param][mparam];

  return null;
}
export function getComponentPropertyList(props) {
  if (props && props.properties) {
    return Object.keys(props.properties).map(t => ({
      title: t,
      id: props.properties[t],
      value: t
    }));
  }
  return [];
}
export function hasComponentProperty(props, prop) {
  return props && props.properties && props.properties.hasOwnProperty(prop);
}
export function getComponentProperty(props, prop, type = "properties") {
  return props && props[type] && props[type][prop];
}
export function GetGroup(graph, id) {
  if (graph && graph.groupLib) {
    return graph.groupLib[id];
  }
  return null;
}
export function applyConstraints(graph) {
  const functionNodes = graph.functionNodes;
  if (functionNodes) {
    for (const i in functionNodes) {
      const node = GetNode(graph, i);
      if (node) {
        const functionType = GetNodeProp(node, NodeProperties.FunctionType);
        if (functionType) {
          const functionConstraintObject = Functions[functionType];
          if (functionConstraintObject) {
            graph = checkConstraints(graph, {
              id: i,
              functionConstraints: functionConstraintObject
            });
          }
        }
      }
    }
  }
  const validationNodes = NodesByType(graph, NodeTypes.Validator);
  validationNodes.map(x => {
    graph = applyValidationNodeRules(graph, x);
  });
  return graph;
}

function applyValidationNodeRules(graph, node) {
  // const validator = GetNodeProp(node, NodeProperties.Validator);
  // if (validator) {
  //   // const nodesLinks = getNodesLinkedTo(graph, { id: node.id });
  //   const validatorProperties = getValidatorProperties(validator);
  //   Object.keys(validatorProperties).map(property => {
  //     if (graph.nodeLinks[property] && graph.nodeLinks[property][node.id]) {
  //       // link between nodes exists.
  //     } else {
  //       // link between nodes exists.
  //     }
  //   });
  // }
  return graph;
}

export function NodesByViewPackage(graph, viewPackage) {
  const currentGraph = graph;
  if (currentGraph) {
    if (!Array.isArray(viewPackage)) {
      viewPackage = [viewPackage];
    }
    if (AppCache && AppCache.Nodes) {
      const temp = [];
      viewPackage.forEach(nt => {
        if (AppCache && AppCache.ViewPackages && AppCache.ViewPackages[nt]) {
          temp.push(...Object.keys(AppCache.ViewPackages[nt]))
        }
      })
      const res = [];
      temp.forEach(x => {
        if (currentGraph.nodeLib[x]) {
          res.push(currentGraph.nodeLib[x]);
        }
      });
      return res;
    }
  }

  return [];
}

export function NodesByType(graph, nodeType, options = {}) {
  const currentGraph = graph;
  if (currentGraph) {
    if (!Array.isArray(nodeType)) {
      nodeType = [nodeType];
    }
    if (AppCache && AppCache.Nodes) {
      const temp = [];
      nodeType.forEach(nt => {
        if (AppCache && AppCache.Nodes && AppCache.Nodes[nt]) {
          temp.push(...Object.keys(AppCache.Nodes[nt]))
        }
      })
      const res = [];
      temp.forEach(x => {
        if (currentGraph.nodeLib[x]) {
          res.push(currentGraph.nodeLib[x]);
        }
      });
      return res;
    }

    return currentGraph.nodes
      .filter(
        x =>
          (currentGraph.nodeLib &&
            currentGraph.nodeLib[x] &&
            currentGraph.nodeLib[x].properties &&
            nodeType.indexOf(
              currentGraph.nodeLib[x].properties[NodeProperties.NODEType]
            ) !== -1) ||
          (!options.excludeRefs &&
            currentGraph.nodeLib[x] &&
            currentGraph.nodeLib[x].properties &&
            currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] ===
            nodeType)
      )
      .map(x => currentGraph.nodeLib[x]);
  }
  return [];
}
export function existsLinkBetween(graph, options) {
  const { source, target, type, direction, properties } = options;
  const link = findLink(graph, { source, target });

  if (link) {
    if (
      properties &&
      Object.keys(properties).some(prop => GetLinkProperty(link, prop) !== properties[prop])
    ) {
      return false;
    }
    return GetLinkProperty(link, LinkPropertyKeys.TYPE) === type || !type;
  }
  return false;
}

export function existsLinksBetween(graph, options) {
  const { source, target1, target2 } = options;
  let link1 = findLink(graph, { source, target: target1.id });
  link1 = GetLinkProperty(link1, LinkPropertyKeys.TYPE) === target1.link;
  let link2 = findLink(graph, { source, target: target2.id });
  link2 = GetLinkProperty(link2, LinkPropertyKeys.TYPE) === target2.link;

  return !!link1 && !!link2;
}

export function updateReferenceNodes(root) {
  if (root && root.referenceNodes) {
    for (const scope in root.referenceNodes) {
      if (root.graphs && root.graphs[scope]) {
        const scopedGraph = root.graphs[scope];
        for (const nodeId in root.referenceNodes[scope]) {
          const masterNode = root.nodeLib[root.referenceNodes[scope][nodeId]];
          if (masterNode) {
            const refNode = GetNode(scopedGraph, nodeId);
            if (refNode) {
              // may be more properties later.
              refNode.properties.text = masterNode.properties.text;
              refNode.properties.referenceType = masterNode.properties.nodeType;
            }
          }
        }
      }
    }
  }

  return root;
}
export function constraintSideEffects(graph) {
  const functionNodes = graph.functionNodes;

  if (functionNodes) {
    let classes_that_must_exist = [];
    for (const i in functionNodes) {
      var function_node = GetNode(graph, i);
      if (function_node) {
        const functionType = GetNodeProp(
          function_node,
          NodeProperties.FunctionType
        );
        if (functionType) {
          const functionConstraintObject = Functions[functionType];
          if (
            functionConstraintObject &&
            functionConstraintObject[FUNCTION_REQUIREMENT_KEYS.CLASSES]
          ) {
            const functionConstraintRequiredClasses =
              functionConstraintObject[FUNCTION_REQUIREMENT_KEYS.CLASSES];
            if (functionConstraintRequiredClasses) {
              for (const j in functionConstraintRequiredClasses) {
                // Get the model constraint key.
                // Should be able to find the singular model that is connected to the functionNode and children, if it exists.
                const constraintModelKey =
                  functionConstraintRequiredClasses[j][
                  INTERNAL_TEMPLATE_REQUIREMENTS.MODEL
                  ];
                if (constraintModelKey) {
                  const constraint_nodes = getNodesFunctionsConnected(graph, {
                    id: i,
                    constraintKey: constraintModelKey
                  });
                  var nodes_one_step_down_the_line = [];
                  constraint_nodes.map(cn => {
                    const nextNodes = getNodesLinkedTo(graph, { id: cn.id });
                    nodes_one_step_down_the_line.push(...nextNodes);
                  });
                  nodes_one_step_down_the_line.map(node => {
                    classes_that_must_exist.push({
                      nodeId: node.id,
                      functionNode: function_node.id,
                      key: constraintModelKey,
                      class: j
                    });
                  });
                }
              }
            }
          }
        }
      }
      classes_that_must_exist = [
        ...classes_that_must_exist.unique(x => JSON.stringify(x))
      ];
      // Remove class nodes that are no longer cool.
      Object.keys(graph.classNodes).map(i => {
        if (
          !classes_that_must_exist.find(cls => {
            const _cnode = graph.nodeLib[i];
            const res = GetNodeProp(
              _cnode,
              NodeProperties.ClassConstructionInformation
            );
            return matchObject(res, cls);
          })
        ) {
          graph = removeNode(graph, { id: i });
        } else {
        }
      });
      // Could make this faster by using a dictionary
      classes_that_must_exist.map(cls => {
        const matching_nodes = Object.keys(graph.classNodes).filter(i => {
          const _cnode = graph.nodeLib[i];
          const res = GetNodeProp(
            _cnode,
            NodeProperties.ClassConstructionInformation
          );
          if (matchObject(res, cls)) {
            return true;
          }
          return false;

        });
        if (matching_nodes.length === 0) {
          // Create new classNodes
          graph = addNewNodeOfType(
            graph,
            {
              parent: cls.functionNode,
              linkProperties: {
                properties: { ...LinkProperties.RequiredClassLink }
              }
            },
            NodeTypes.ClassNode,
            new_node => {
              graph = updateNodeProperty(graph, {
                id: new_node.id,
                prop: NodeProperties.UIText,
                value: RequiredClassName(
                  cls.class,
                  GetNodeProp(
                    GetNode(graph, cls.nodeId),
                    NodeProperties.CodeName
                  )
                )
              });
              graph = updateNodeProperty(graph, {
                id: new_node.id,
                prop: NodeProperties.ClassConstructionInformation,
                value: cls
              });
            }
          );
        } else if (matching_nodes.length === 1) {
          const _cnode = graph.nodeLib[matching_nodes[0]];
          // The existing classNodes can be updated with any new dependent values. e.g. Text/title
          graph = updateNodeProperty(graph, {
            id: _cnode.id,
            prop: NodeProperties.UIText,
            value: RequiredClassName(
              cls.class,
              GetNodeProp(GetNode(graph, cls.nodeId), NodeProperties.CodeName)
            )
          });
        } else {
          console.error("There should never be more than one");
        }
      });
    }
  }

  return graph;
}

export function RequiredClassName(cls, node_name) {
  return `${node_name}${cls}`;
}

export function getNodesFunctionsConnected(graph, options) {
  const { id, constraintKey } = options;
  const result = [];

  const links = getNodeLinksWithKey(graph, { id, key: constraintKey });

  return links.map(link => graph.nodeLib[link.target]);
}

export function checkConstraints(graph, options) {
  const { id, functionConstraints } = options;
  if (graph.nodeConnections[id]) {
    const node = graph.nodeLib[id];
    Object.keys(graph.nodeConnections[id]).map(link => {
      // check if link has a constraint attached.
      const { properties } = graph.linkLib[link];
      const _link = graph.linkLib[link];
      if (properties) {
        const { constraints } = properties;
        if (constraints) {
          Object.keys(FunctionTemplateKeys).map(ftk => {
            const functionTemplateKey = FunctionTemplateKeys[ftk];
            const constraintObj =
              functionConstraints.constraints[functionTemplateKey];
            if (
              constraintObj &&
              _link &&
              _link.properties &&
              _link.properties.constraints &&
              _link.properties.constraints.key
            ) {
              if (_link.properties.constraints.key === constraintObj.key) {
                const valid = FunctionMeetsConstraint.meets(
                  constraintObj,
                  constraints,
                  _link,
                  node,
                  graph
                );
                graph = updateLinkProperty(graph, {
                  id: _link.id,
                  prop: LinkPropertyKeys.VALID_CONSTRAINTS,
                  value: !!valid
                });
              }
            }
          });
        }
      }
    });
  }
  return graph;
}

export function applyFunctionConstraints(graph, options) {
  const { id, value } = options;

  const functionConstraints = Functions[value];
  if (functionConstraints) {
    if (functionConstraints.constraints) {
      if (graph.nodeConnections[id]) {
        getNodeFunctionConstraintLinks(graph, { id }).map(link => {
          const link_constraints = GetLinkProperty(
            link,
            LinkPropertyKeys.CONSTRAINTS
          );
          if (
            !hasMatchingConstraints(
              link_constraints,
              functionConstraints.constraints
            )
          ) {
            const nodeToRemove = GetTargetNode(graph, link.id);

            if (nodeToRemove) {
              graph = removeNode(graph, { id: nodeToRemove.id });
            } else {
              console.warn("No nodes were removed as exepected");
            }
          }
        });
      }
      let core_group = null;
      let internal_group = null; // Internal scope group
      let external_group = null; // API Group
      const node = graph.nodeLib[id];

      const existingGroups = GetNodeProp(node, NodeProperties.Groups);

      if (existingGroups) {
        for (const i in existingGroups) {
          graph = clearGroup(graph, { id: existingGroups[i] });
        }
      }

      if (graph.nodesGroups[id]) {
        for (const i in graph.nodesGroups[id]) {
          switch (
          GetGroupProperty(graph.groupLib[i], GroupProperties.FunctionGroup)
          ) {
            case FunctionGroups.Core:
              core_group = graph.groupLib[i];
              break;
          }
        }
      }
      if (!core_group) {
        graph = newGroup(graph, _group => {
          core_group = _group;
          graph = updateGroupProperty(graph, {
            id: _group.id,
            prop: GroupProperties.FunctionGroup,
            value: FunctionGroups.Core
          });
        });
      }

      if (!internal_group) {
        graph = newGroup(graph, _group => {
          internal_group = _group;
          graph = updateGroupProperty(graph, {
            id: _group.id,
            prop: GroupProperties.FunctionGroup,
            value: FunctionGroups.Internal
          });
        });
      }

      if (!external_group) {
        graph = newGroup(graph, _group => {
          external_group = _group;
          graph = updateGroupProperty(graph, {
            id: _group.id,
            prop: GroupProperties.FunctionGroup,
            value: FunctionGroups.External
          });
        });
      }

      if (
        !graph.groupsNodes[external_group.id] ||
        !graph.groupsNodes[external_group.id][id]
      ) {
        graph = addLeaf(graph, { leaf: id, id: external_group.id });
      }

      if (
        !graph.childGroups[internal_group.id] ||
        !graph.childGroups[internal_group.id][external_group.id]
      ) {
        graph = addGroupToGroup(graph, {
          groupId: internal_group.id,
          id: external_group.id
        });
      }

      if (
        !graph.childGroups[core_group.id] ||
        !graph.childGroups[core_group.id][internal_group.id]
      ) {
        graph = addGroupToGroup(graph, {
          groupId: core_group.id,
          id: internal_group.id
        });
      }

      const existMatchinLinks = getNodeFunctionConstraintLinks(graph, { id });
      const constraintKeys = existMatchinLinks.map(link => {
        const link_constraints = GetLinkProperty(
          link,
          LinkPropertyKeys.CONSTRAINTS
        );
        return findMatchingConstraints(
          link_constraints,
          functionConstraints.constraints
        );
      });

      Object.keys(functionConstraints.constraints).map(constraint => {
        // Create links to new nodes representing those constraints.
        if (constraintKeys.indexOf(constraint) === -1) {
          graph = addNewNodeOfType(
            graph,
            {
              parent: node.id,
              linkProperties: {
                properties: {
                  type: LinkType.FunctionConstraintLink,
                  constraints: {
                    ...functionConstraints.constraints[constraint]
                  }
                }
              }
            },
            NodeTypes.Parameter,
            new_node => {
              graph = updateNodeProperty(graph, {
                id: new_node.id,
                prop: NodeProperties.UIText,
                value: constraint
              });
            }
          );
        }
      });

      const nodes_with_link = getNodeFunctionConstraintLinks(graph, {
        id: node.id
      });

      nodes_with_link.map(link => {
        const new_node = graph.nodeLib[link.target];
        const constraint = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
        if (
          constraint &&
          constraint.key &&
          functionConstraints.constraints[constraint.key] &&
          functionConstraints.constraints[constraint.key][
          FunctionConstraintKeys.IsInputVariable
          ]
        ) {
          graph = addLeaf(graph, { leaf: new_node.id, id: internal_group.id });
        } else {
          graph = addLeaf(graph, { leaf: new_node.id, id: core_group.id });
        }
      });

      if (graph.nodeConnections[id]) {
        Object.keys(graph.nodeConnections[id]).map(link => {
          // check if link has a constraint attached.
          const { properties } = graph.linkLib[link];
          const _link = graph.linkLib[link];
          if (properties) {
            const { constraints } = properties;
            if (constraints) {
              Object.keys(FunctionTemplateKeys).map(ftk => {
                const functionTemplateKey = FunctionTemplateKeys[ftk];
                const constraintObj =
                  functionConstraints.constraints[functionTemplateKey];
                if (
                  constraintObj &&
                  _link &&
                  _link.properties &&
                  _link.properties.constraints &&
                  _link.properties.constraints.key
                ) {
                  if (_link.properties.constraints.key === constraintObj.key) {
                    const valid = FunctionMeetsConstraint.meets(
                      constraintObj,
                      constraints,
                      _link,
                      node,
                      graph
                    );
                    graph = updateLinkProperty(graph, {
                      id: _link.id,
                      prop: LinkPropertyKeys.VALID_CONSTRAINTS,
                      value: !!valid
                    });
                  }
                }
              });
            }
          }
        });
      }
      graph = updateNodeProperty(graph, {
        id,
        prop: NodeProperties.Groups,
        value: {
          core: core_group.id,
          internal: internal_group.id,
          external: external_group.id
        }
      });
    }
  }

  return graph;
}

function getNodeLinksWithKey(graph, options) {
  const { id, key } = options;
  const result = [];
  if (graph.nodeConnections[id]) {
    return Object.keys(graph.nodeConnections[id])
      .map(link => {
        const _link = graph.linkLib[link];
        return _link;
      })
      .filter(_link => (
        _link &&
        _link.source === id &&
        _link.properties &&
        _link.properties.constraints &&
        _link.properties.constraints.key === key
      ));
  }

  return result;
}

function hasMatchingConstraints(linkConstraint, functionConstraints) {
  return !!findMatchingConstraints(linkConstraint, functionConstraints);
}
function findMatchingConstraints(linkConstraint, functionConstraints) {
  const lcj = JSON.stringify(linkConstraint);
  return Object.keys(functionConstraints).find(
    f => JSON.stringify(functionConstraints[f]) === lcj
  );
}

function getNodeFunctionConstraintLinks(graph, options) {
  const { id } = options;
  if (graph && graph.nodeConnections && graph.nodeConnections[id]) {
    return Object.keys(graph.nodeConnections[id])
      .filter(link => (
        GetLinkProperty(graph.linkLib[link], LinkPropertyKeys.TYPE) ===
        LinkType.FunctionConstraintLink
      ))
      .map(link => graph.linkLib[link]);
  }

  return [];
}

export const FunctionMeetsConstraint = {
  meets: (constraintObj, constraints, link, node, graph) => {
    if (constraintObj) {
      const _targetNode = graph.nodeLib[link.target];
      const nextNodes = getNodesLinkedTo(graph, { id: _targetNode.id });
      return nextNodes.find(targetNode => Object.keys(constraintObj).find(constraint => {
        let result = true;
        if (result === false) {
          return;
        }
        switch (constraint) {
          // Instance variable are always ok
          // case FunctionConstraintKeys.IsInstanceVariable:
          //     result = true;
          //     break;
          case FunctionConstraintKeys.IsAgent:
            if (targetNode) {
              if (!GetNodeProp(targetNode, NodeProperties.IsAgent)) {
                result = false;
              }
            } else {
              result = false;
            }
            break;
          case FunctionConstraintKeys.IsUser:
            if (targetNode) {
              if (!GetNodeProp(targetNode, NodeProperties.IsUser)) {
                result = false;
              }
            } else {
              result = false;
            }
            break;
          case FunctionConstraintKeys.IsTypeOf:
            // If it is an input variable, then we will all anything.
            if (!constraintObj[FunctionConstraintKeys.IsInputVariable]) {
              if (targetNode) {
                const targetNodeType = GetNodeProp(
                  targetNode,
                  NodeProperties.NODEType
                );
                const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
                // The targetNodeType should match the other node.
                const linkWithConstraints = findLinkWithConstraint(
                  node.id,
                  graph,
                  targetConstraint
                );
                if (linkWithConstraints.length) {
                  const links = linkWithConstraints.filter(
                    linkWithConstraint => {
                      const nodeToMatchWith =
                        graph.nodeLib[linkWithConstraint.target];
                      const nodeToMatchWithType = GetNodeProp(
                        nodeToMatchWith,
                        NodeProperties.NODEType
                      );
                      return nodeToMatchWithType !== targetNodeType;
                    }
                  );
                  if (links.length === 0) {
                    result = false;
                  }
                } else {
                  result = false;
                }
              } else {
                result = false;
              }
            }
            break;
          case FunctionConstraintKeys.IsChild:
            if (targetNode) {
              // let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
              const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
              // The targetNodeType should match the other node.
              const linkWithConstraints = findLinkWithConstraint(
                node.id,
                graph,
                targetConstraint
              );
              if (linkWithConstraints) {
                const links = linkWithConstraints.filter(linkWithConstraint => {
                  const nodeToMatchWith =
                    graph.nodeLib[linkWithConstraint.target];
                  const linkToParentParameter = getNodeLinkedTo(graph, {
                    id: nodeToMatchWith.id
                  });
                  if (linkToParentParameter && linkToParentParameter.length) {
                    const relationshipLink = findLink(graph, {
                      target: targetNode.id,
                      source: linkToParentParameter[0].id
                    });
                    if (
                      !relationshipLink ||
                      GetLinkProperty(
                        relationshipLink,
                        LinkPropertyKeys.TYPE
                      ) !== LinkProperties.ParentLink.type
                    ) {
                      return false;
                    }
                  } else {
                    return false;
                  }
                  return true;
                });

                if (links.length === 0) {
                  result = false;
                }
              } else {
                result = false;
              }
            } else {
              result = false;
            }
            break;
          case FunctionConstraintKeys.IsParent:
            if (targetNode) {
              // let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
              const targetConstraint = constraintObj[constraint]; // FunctionConstraintKeys.Model
              // The targetNodeType should match the other node.
              const linkWithConstraints = findLinkWithConstraint(
                node.id,
                graph,
                targetConstraint
              );
              if (linkWithConstraints) {
                const links = linkWithConstraints.filter(linkWithConstraint => {
                  const nodeToMatchWith =
                    graph.nodeLib[linkWithConstraint.target];
                  const linkToParentParameter = getNodeLinkedTo(graph, {
                    id: nodeToMatchWith.id
                  });
                  if (linkToParentParameter && linkToParentParameter.length) {
                    const relationshipLink = findLink(graph, {
                      target: targetNode.id,
                      source: linkToParentParameter[0].id
                    });
                    if (
                      !relationshipLink ||
                      GetLinkProperty(
                        relationshipLink,
                        LinkPropertyKeys.TYPE
                      ) !== LinkProperties.ParentLink.type
                    ) {
                      return false;
                    }
                  } else {
                    return false;
                  }
                  return true;
                });

                if (links.length === 0) {
                  result = false;
                }
              } else {
                result = false;
              }
            } else {
              result = false;
            }
            break;
        }

        return result;
      }));
    }

    return false;
  }
};
function findLinkWithConstraint(nodeId, graph, targetConstraint) {
  return Object.keys(graph.nodeConnections[nodeId])
    .filter(t => graph.nodeConnections[nodeId][t] === SOURCE)
    .filter(link => {
      if (
        link &&
        graph.linkLib &&
        graph.linkLib[link] &&
        graph.linkLib[link].properties &&
        graph.linkLib[link].properties.constraints &&
        graph.linkLib[link].properties.constraints.key === targetConstraint
      ) {
        return graph.linkLib[link];
      }
      return false;
    })
    .map(link => graph.linkLib[link]);
}
export function getNodeLinks(graph, id, direction) {
  if (graph && graph.nodeConnections && graph.nodeConnections[id]) {
    return Object.keys(graph.nodeConnections[id])
      .filter(x => {
        if (direction) {
          return graph.nodeConnections[id][x] === direction;
        }
        return true;
      })
      .map(link => graph.linkLib[link]);
  }
  return [];
}
export function findLink(graph, options) {
  const { target, source } = options;
  if (graph.nodeLinkIds && graph.nodeLinkIds[source] && graph.nodeLinkIds[source][target]) {
    const linkId = graph.nodeLinkIds[source][target];
    if (linkId && graph.linkLib[linkId]) {
      return graph.linkLib[linkId];
    }
  }
  // const res = graph.links.find(link => (
  //   graph.linkLib &&
  //   graph.linkLib[link] &&
  //   graph.linkLib[link].target === target &&
  //   graph.linkLib[link].source === source
  // ));
  // if (res) {
  //   return graph.linkLib[res];
  // }
  return null;
}
export function newLink(graph, options) {
  const { target, source, properties } = options;
  const link = createLink(target, source, properties);
  return addLink(graph, options, link);
}

export function GetTargetNode(graph, linkId) {
  if (graph && graph.linkLib && graph.linkLib[linkId]) {
    const target = graph.linkLib[linkId].target;
    return graph.nodeLib[target];
  }
  return null;
}

export function getNodesLinkedFrom(graph, options) {
  return getNodeLinked(graph, { ...(options || {}), direction: TARGET });
}
export function getNodesLinkedTo(graph, options) {
  return getNodeLinkedTo(graph, options);
}
export function getNodeLinkedTo(graph, options) {
  return getNodeLinked(graph, { ...(options || {}), direction: SOURCE });
}
export function matchOneWay(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (!obj1) {
    return false;
  }
  if (!obj2) {
    return false;
  }
  for (const i in obj1) {
    if (obj1[i] !== obj2[i]) {
      return false;
    }
  }
  return true;
}
export function matchObject(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  for (const i in obj1) {
    if (obj1[i] !== obj2[i]) {
      return false;
    }
  }

  return true;
}
export function GetLinkByNodes(graph, options) {
  const { source, target } = options;
  return [findLink(graph, { target, source })]
  // return Object.values(graph.linkLib).find(t => t.source === source && t.target === target);
}
export function GetLinkChainItem(state, options) {
  const chains = GetLinkChain(state, options);

  if (chains && chains.length) {
    return chains[0];
  }
  return null;
}
export function SetAffterEffectProperty(currentNode, afterMethod, key, value) {
  const afterEffectSetup =
    GetNodeProp(currentNode, NodeProperties.AfterMethodSetup) || {};
  afterEffectSetup[afterMethod] = afterEffectSetup[afterMethod] || {};
  afterEffectSetup[afterMethod] = {
    ...afterEffectSetup[afterMethod],
    ...{ [key]: value }
  };
  return afterEffectSetup;
}
export function GetAffterEffectProperty(currentNode, afterMethod, key) {
  const afterEffectSetup = GetNodeProp(
    currentNode,
    NodeProperties.AfterMethodSetup
  );
  if (
    afterEffectSetup &&
    afterEffectSetup[afterMethod] &&
    afterEffectSetup[afterMethod][key]
  )
    return afterEffectSetup[afterMethod][key];
  return null;
}
export function GetMethodNode(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Method);
}
export function GetPermissionNode(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).find(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Permission
  );
}
export function GetConditionNodes(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition
  );
}
export function GetConnectedNodesByType(state, id, type, direction) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id,
    direction
  }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === type);
}
export function GetDataChainEntryNodes(state, cs) {
  const graph = GetRootGraph(state);
  return NodesByType(graph, NodeTypes.DataChain).filter(
    x =>
      (!cs && GetNodeProp(x, NodeProperties.EntryPoint)) ||
      (cs && GetNodeProp(x, NodeProperties.CSEntryPoint))
  );
}
export function GetConnectedNodeByType(state, id, type, direction, graph) {
  if (!Array.isArray(type)) {
    type = [type];
  }
  graph = graph || GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id,
    direction
  }).find(x => {
    const ntype = GetNodeProp(x, NodeProperties.NODEType);
    return type.some(v => v === ntype);
  });
}
export function GetValidationNode(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Validator);
}
export function GetDataSourceNode(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).find(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataSource
  );
}
export function GetModelItemFilter(state, id) {
  const graph = GetRootGraph(state);
  return GetNodesLinkedTo(graph, {
    id
  }).find(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ModelItemFilter
  );
}
export function GetLinkChain(state, options) {
  const graph = GetCurrentGraph(state);
  return GetLinkChainFromGraph(graph, options);
}
export function GetLinkChainFromGraph(graph, options, nodeType) {
  const { id, links } = options;
  let ids = [id];
  let result = [];
  links.map((op, il) => {
    let newids = [];
    ids.map(i => {
      const newnodes = getNodesByLinkType(graph, {
        id: i,
        ...op
      });
      if (il === links.length - 1) {
        result = newnodes;
      } else {
        newids = [...newids, ...newnodes.map(t => t.id)];
      }
    });
    newids = newids.unique(x => x);
    ids = newids;
  });
  return result.filter(x => {
    if (!nodeType) {
      return true;
    }
    return nodeType.indexOf(GetNodeProp(x, NodeProperties.NODEType)) !== -1;
  });
}
export function getNodesLinkTypes(graph, options) {
  if (options) {
    const { id } = options;
    const links = graph.nodeConnections[id] || {};
    const groups = Object.keys(links).groupBy(x =>
      GetLinkProperty(graph.linkLib[x], LinkPropertyKeys.TYPE)
    );
    return Object.keys(groups);
  }
  return [];
}
export function getNodesByLinkType(graph, options) {
  if (options) {
    const { id, direction, type, exist } = options;
    if (graph && graph.nodeConnections && id) {
      const nodeLinks = graph.nodeConnections[id];
      if (nodeLinks) {
        return Object.keys(nodeLinks)
          .filter(x => nodeLinks[x])
          .map(_id => {
            const target = graph.linkLib[_id]
              ? direction === TARGET
                ? graph.linkLib[_id].source
                : graph.linkLib[_id].target
              : null;

            if (!target) {
              console.warn("Missing value in linkLib");
              return null;
            }
            if (
              exist &&
              graph.linkLib[_id].properties &&
              graph.linkLib[_id].properties.exist
            ) {
              return graph.nodeLib[target];
            }
            if (
              !type ||
              (graph.linkLib[_id].properties &&
                (graph.linkLib[_id].properties.type === type ||
                  graph.linkLib[_id].properties[type]))
            ) {
              return graph.nodeLib[target];
            }
            return null;
          })
          .filter(x => x);
      }
    }
  }

  return [];
}

export function GetLinkBetween(a, b, graph) {
  return findLink(graph, {
    source: a,
    target: b
  });
  // return getNodeLinks(graph, a, SOURCE).find(v => v.target === b);
}
export function getNodeLinked(graph, options) {
  if (options) {
    const { id, direction, constraints } = options;
    if (graph && graph.nodeConnections && id) {
      const nodeLinks = graph.nodeConnections[id];
      if (nodeLinks) {
        return Object.keys(nodeLinks)
          .filter(x => nodeLinks[x] === direction)
          .map(_id => {
            const target = graph.linkLib[_id]
              ? direction === TARGET
                ? graph.linkLib[_id].source
                : graph.linkLib[_id].target
              : null;
            if (!target) {
              console.warn("Missing value in linkLib");
              return null;
            }
            if (constraints) {
              const link = graph.linkLib[_id];
              const link_constraints = GetLinkProperty(
                link,
                LinkPropertyKeys.CONSTRAINTS
              );
              if (matchOneWay(constraints, link_constraints)) {
                return graph.nodeLib[target];
              }
              return null;

            }
            return graph.nodeLib[target];
          })
          .filter(x => x);
      }
    }
  }
  return [];
}
export function GetNodeLinkedTo(graph, options) {
  return GetNodesLinkedTo(graph, options)[0];
}
export function GetLinkedNodes(graph, options) {
  const { id } = options;
  graph = graph || GetCurrentGraph();
  if (graph && graph.nodeLinks && id) {
    const nodeLinks = graph.nodeLinks[id];
    return { ...nodeLinks }
  }

  return {};
}
export function GetNodesLinkedTo(graph, options) {
  if (options) {
    graph = graph || GetCurrentGraph();
    const { id, direction, link, componentType, properties } = options;
    if (graph && graph.nodeConnections && id) {
      const nodeLinks = graph.nodeConnections[id];
      if (nodeLinks) {
        return Object.keys(nodeLinks)
          .map(_id => {
            let target = null;
            if (link) {
              if (
                GetLinkProperty(graph.linkLib[_id], LinkPropertyKeys.TYPE) !==
                link
              ) {
                return null;
              }
              if (properties) {
                for (const prop in properties) {
                  if (
                    properties[prop] !==
                    GetLinkProperty(graph.linkLib[_id], prop)
                  ) {
                    return null;
                  }
                }
              }
            }
            if (graph.linkLib[_id]) {
              if (graph.linkLib[_id].source !== id) {
                if (!direction || direction === TARGET)
                  target = graph.linkLib[_id].source;
              } else if (!direction || direction === SOURCE)
                target = graph.linkLib[_id].target;
            }

            if (!target) {
              // console.warn('Missing value in linkLib');
              return null;
            }
            return graph.nodeLib[target];
          })
          .filter(x => x)
          .filter(x => {
            if (componentType) {
              return GetNodeProp(x, NodeProperties.NODEType) === componentType;
            }
            return true;
          });
      }
    }
  }
  return [];
}

export const SOURCE = "SOURCE";
export const TARGET = "TARGET";
const fast = true;
export function addLink(graph, options, link) {
  const { target, source } = options;
  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }

  if (target && source && target !== source) {
    if (graph.nodeLib[target] && graph.nodeLib[source]) {
      if (noSameLink(graph, { target, source })) {
        graph.linkLib[link.id] = link;
        if (!fast) {
          graph.linkLib = { ...graph.linkLib };
          graph.links = [...graph.links, link.id];
        }
        else if (graph.links.indexOf(link.id) === -1) {
          graph.links.push(link.id);
        }

        updateCache(options, link);
        // Keeps track of the links for each node.
        if (fast) {
          if (!graph.nodeConnections[link.source]) {
            graph.nodeConnections[link.source] = {};
          }
          graph.nodeConnections[link.source][link.id] = SOURCE;

        } else {
          graph.nodeConnections[link.source] = {
            ...(graph.nodeConnections[link.source] || {}),
            ...{
              [link.id]: SOURCE
            }
          };
        }

        if (fast) {
          if (!graph.nodeConnections[link.target]) {
            graph.nodeConnections[link.target] = {};
          }
          graph.nodeConnections[link.target][link.id] = TARGET
        }
        else {
          // Keeps track of the links for each node.
          graph.nodeConnections[link.target] = {
            ...(graph.nodeConnections[link.target] || {}),
            ...{
              [link.id]: TARGET
            }
          };
        }

        if (fast) {
          if (!graph.nodeLinks[link.source]) {
            graph.nodeLinks[link.source] = {};
          }
          graph.nodeLinks[link.source][link.target] = graph.nodeLinks[link.source]
            ? (graph.nodeLinks[link.source][link.target] || 0) + 1
            : 1;
        }
        else {
          // Keeps track of the number of links between nodes.
          graph.nodeLinks[link.source] = {
            ...(graph.nodeLinks[link.source] || {}),
            ...{
              [link.target]: graph.nodeLinks[link.source]
                ? (graph.nodeLinks[link.source][link.target] || 0) + 1
                : 1
            }
          };
        }
        if (!graph.nodeLinkIds[link.source]) {
          graph.nodeLinkIds[link.source] = {};
        }
        graph.nodeLinkIds[link.source][link.target] = link.id;

        if (fast) {
          if (!graph.nodeLinks[link.target]) {
            graph.nodeLinks[link.target] = {};
          }
          graph.nodeLinks[link.target][link.source] = graph.nodeLinks[link.target]
            ? (graph.nodeLinks[link.target][link.source] || 0) + 1
            : 1;
        }
        else {
          // Keeps track of the number of links between nodes.
          graph.nodeLinks[link.target] = {
            ...graph.nodeLinks[link.target],
            ...{
              [link.source]: graph.nodeLinks[link.target]
                ? (graph.nodeLinks[link.target][link.source] || 0) + 1
                : 1
            }
          };
        }
      } else {
        const oldLink = findLink(graph, { target, source });
        if (oldLink) {
          //  the type won't change onces its set
          // But the other properties can be
          oldLink.properties = {
            ...oldLink.properties,
            ...link.properties,
            ...{ type: oldLink.properties.type }
          };
        }
      }
      if (!fast) {
        graph.nodeLinks = { ...graph.nodeLinks };
        graph = { ...graph };
      }
    }
    graph = incrementMinor(graph);
  }

  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }

  return graph;
}
export function addLinksBetweenNodes(graph, options) {
  const { links } = options;
  if (links && links.length) {
    links.map(link => {
      graph = addLinkBetweenNodes(graph, link);
    });
  }
  return graph;
}
export function addLinkBetweenNodes(graph, options) {
  const { target, source, properties } = options;
  if (target !== source && target) {
    const link = createLink(target, source, properties);
    return addLink(graph, options, link);
  }
  return graph;
}
function compareLinkProp(properties, link) {
  for (const i in properties) {
    if (
      !link.properties ||
      link.properties[i] !== properties[i]
    ) {
      if (typeof link.properties[i] === "object") {
        return (
          JSON.stringify(link.properties) ===
          JSON.stringify(properties)
        );
      }
      return false;
    }
  }
  return true;
}
export function findLinkInstance(graph, options) {
  const { target, source, properties } = options;
  if (properties) {
    if (target && source) {
      const linkObject = findLink(graph, { target, source });
      if (linkObject && linkObject.properties) {
        if (!compareLinkProp(properties, linkObject)) {
          return false;
        }
        return linkObject.id;
      }

    }
    const link = graph.links.find(x => {
      if (
        graph.linkLib[x].source === source &&
        graph.linkLib[x].target === target
      ) {
        // for (const i in properties) {
        //   if (
        //     !graph.linkLib[x].properties ||
        //     graph.linkLib[x].properties[i] !== properties[i]
        //   ) {
        //     if (typeof graph.linkLib[x].properties[i] === "object") {
        //       return (
        //         JSON.stringify(graph.linkLib[x].properties) ===
        //         JSON.stringify(properties)
        //       );
        //     }
        //     return false;
        //   }
        if (!compareLinkProp(properties, graph.linkLib[x])) {
          return false;
        }

        return true;
      }
      return false;
    });
    return link;
  }
  const link =
    graph && graph.links
      ? graph.links.find(
        x =>
          graph.linkLib[x] &&
          graph.linkLib[x].source === source &&
          graph.linkLib[x].target == target
      )
      : null;
  return link;
}
export function getLinkInstance(graph, options) {
  const linkId = findLinkInstance(graph, options);
  if (linkId) {
    return graph.linkLib[linkId];
  }
  return null;
}
export function getLink(graph, options) {
  const { id } = options;
  if (id && graph && graph.linkLib) {
    return graph.linkLib[id];
  }
  return null;
}
export function getAllLinksWithNode(graph, id) {
  return graph.links.filter(x => {
    if (!graph.linkLib[x]) {
      delete graph.linkLib[x];
    }
    return (
      graph.linkLib[x] &&
      (graph.linkLib[x].source === id || graph.linkLib[x].target === id)
    );
  });
}
export function removeLinkBetweenNodes(graph, options) {
  const link = findLinkInstance(graph, options);
  return removeLink(graph, link, options);
}
export function removeLinkById(graph, options) {
  const link = graph.linkLib[options.id];
  return removeLink(graph, link);
}
export function executeEvents(graph, link, evt) {
  switch (evt) {
    case LinkEvents.Remove:
      graph = executeRemoveEvents(graph, link);
      break;
  }
  return graph;
}
export const EventFunctions = {};
export function addEventFunction(key, func) {
  EventFunctions[key] = func;
}
export function removeEventFunction(key) {
  delete EventFunctions[key];
}
export function executeRemoveEvents(graph, link) {
  if (
    link &&
    link.properties &&
    link.properties.on &&
    link.properties.on[LinkEvents.Remove]
  ) {
    link.properties.on[LinkEvents.Remove].map(args => {
      if (args.function && EventFunctions[args.function]) {
        graph = EventFunctions[args.function](graph, link, args.function, args);
      }
    });
  }
  return graph;
}
export function isUIExtensionEnumerable(node) {
  const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
  if (_node && _node.config) {
    return _node.config.isEnumeration;
  }
}
export function GetUIExentionEnumeration(node) {
  if (isUIExtensionEnumerable(node)) {
    const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
    return _node.config.list;
  }
  return null;
}
export function GetUIExentionKeyField(node) {
  if (isUIExtensionEnumerable(node)) {
    const _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
    return _node.config.keyField;
  }
  return null;
}
addEventFunction("OnRemoveValidationPropConnection", (graph, link, func) => {
  const { source, target } = link;
  const node = GetNode(graph, source);
  if (node && node.properties)
    removeValidator(GetNodeProp(node, NodeProperties.Validator), {
      id: target
    });
  return graph;
});
addEventFunction("OnRemoveExecutorPropConnection", (graph, link, func) => {
  const { source, target } = link;
  const node = GetNode(graph, source);
  if (node && node.properties)
    removeValidator(GetNodeProp(node, NodeProperties.Executor), { id: target });
  return graph;
});

addEventFunction("OnRemoveModelFilterPropConnection", (graph, link, func) => {
  const { source, target } = link;
  const node = GetNode(graph, source);
  if (node && node.properties)
    removeValidator(GetNodeProp(node, NodeProperties.FilterModel), {
      id: target
    });
  return graph;
});

addEventFunction(
  "OnRemoveValidationItemPropConnection",
  (graph, link, func, args) => {
    const { source, target } = link;
    const node = GetNode(graph, source);
    const { property, validator } = args || {};

    const _validator = GetNodeProp(node, NodeProperties.Validator);
    if (
      node &&
      node.properties &&
      _validator.properties &&
      _validator.properties[property] &&
      _validator.properties[property].validators &&
      _validator.properties[property].validators[validator] &&
      _validator.properties[property].validators[validator].node === target
    ) {
      removeValidatorItem(_validator, { ...args, id: target });
    }
    return graph;
  }
);

addEventFunction(
  "OnRemoveExecutorItemPropConnection",
  (graph, link, func, args) => {
    const { source, target } = link;
    const node = GetNode(graph, source);
    const { property, validator } = args || {};

    const _validator = GetNodeProp(node, NodeProperties.Executor);
    if (
      node &&
      node.properties &&
      _validator.properties &&
      _validator.properties[property] &&
      _validator.properties[property].validators &&
      _validator.properties[property].validators[validator] &&
      _validator.properties[property].validators[validator].node === target
    ) {
      removeValidatorItem(_validator, { ...args, id: target });
    }
    return graph;
  }
);

export function removeValidatorItem(_validator, options) {
  const { property, validator } = options;
  delete _validator.properties[property].validators[validator];
}
export function createEventProp(type, options = {}) {
  const res = { on: {} };
  switch (type) {
    case LinkEvents.Remove:
      res.on[type] = [
        {
          ...options
        }
      ];
      break;
  }

  return res;
}
export function removeLink(graph, link, options = {}) {

  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }

  if (link && options.linkType) {
    const update_link = graph.linkLib[link];
    if (
      update_link &&
      update_link.properties &&
      update_link.properties[options.linkType]
    ) {
      delete update_link.properties[options.linkType];

      // If only the type is on the property
    }
    if (update_link && update_link.properties && Object.keys(update_link.properties).length > 1) {
      if (graph.links.length !== Object.keys(graph.linkLib).length) {
        throw new Error('invalid grid links');
      }
      if (fast) {
        return graph
      }
      return { ...graph };
    }
  }
  if (link) {
    graph.links = graph.links.filter(x => x !== link);
    const del_link = graph.linkLib[link];
    if (del_link.properties) {
      if (del_link.properties.on && del_link.properties.on[LinkEvents.Remove]) {
        graph = executeEvents(graph, del_link, LinkEvents.Remove);
      }
    }
    if (graph.linkLib[link] && graph.linkLib[link].properties) {
      removeCacheLink(link, graph.linkLib[link].properties.type);
    }
    if (graph.linkLib[link]) {
      const { source, target } = graph.linkLib[link];
      if (source && target && graph.nodeLinkIds[source] && graph.nodeLinkIds[source][target]) {
        delete graph.nodeLinkIds[source][target];
      }
    }
    delete graph.linkLib[link];

    graph.linkLib = { ...graph.linkLib };
    graph.nodeLinks[del_link.source] = {
      ...graph.nodeLinks[del_link.source],
      ...{
        [del_link.target]: graph.nodeLinks[del_link.source]
          ? (graph.nodeLinks[del_link.source][del_link.target] || 0) - 1
          : 0
      }
    };
    if (
      graph.nodeLinks[del_link.source] &&
      !graph.nodeLinks[del_link.source][del_link.target]
    ) {
      delete graph.nodeLinks[del_link.source][del_link.target];
      if (Object.keys(graph.nodeLinks[del_link.source]).length === 0) {
        delete graph.nodeLinks[del_link.source];
      }
    }
    graph.nodeLinks[del_link.target] = {
      ...graph.nodeLinks[del_link.target],
      ...{
        [del_link.source]: graph.nodeLinks[del_link.target]
          ? (graph.nodeLinks[del_link.target][del_link.source] || 0) - 1
          : 0
      }
    };
    if (
      graph.nodeLinks[del_link.target] &&
      !graph.nodeLinks[del_link.target][del_link.source]
    ) {
      delete graph.nodeLinks[del_link.target][del_link.source];
      if (Object.keys(graph.nodeLinks[del_link.target]).length === 0) {
        delete graph.nodeLinks[del_link.target];
      }
    }

    // Keeps track of the links for each node.
    if (
      graph.nodeConnections[del_link.source] &&
      graph.nodeConnections[del_link.source][del_link.id]
    ) {
      delete graph.nodeConnections[del_link.source][del_link.id];
    }
    if (Object.keys(graph.nodeConnections[del_link.source]).length === 0) {
      delete graph.nodeConnections[del_link.source];
    }

    // Keeps track of the links for each node.
    if (
      graph.nodeConnections[del_link.target] &&
      graph.nodeConnections[del_link.target][del_link.id]
    ) {
      delete graph.nodeConnections[del_link.target][del_link.id];
    }
    if (Object.keys(graph.nodeConnections[del_link.target]).length === 0) {
      delete graph.nodeConnections[del_link.target];
    }
    graph = incrementMinor(graph);
  }
  if (graph.links.length !== Object.keys(graph.linkLib).length) {
    throw new Error('invalid grid links');
  }
  if (fast) {
    return graph
  }
  return { ...graph };
}
export function updateNodeText(graph, options) {
  const { id, value } = options;
  if (id && graph.nodeLib && graph.nodeLib[id]) {
    graph.nodeLib[id] = {
      ...graph.nodeLib[id],
      ...{
        _properties: {
          ...(graph.nodeLib[id].properties || {}),
          i: value
        },
        get properties() {
          return this._properties;
        },
        set properties(value) {
          this._properties = value;
        }
      }
    };
  }
}
export function updateAppSettings(graph, options) {
  const { prop, value } = options;
  if (prop && value) {
    graph.appConfig = graph.appConfig || {};
    graph.appConfig.AppSettings = graph.appConfig.AppSettings || {};
    graph.appConfig.AppSettings[prop] = value;
  }
  return graph;
}

export function updateNodeProperties(graph, options) {
  const { properties, id } = options || {};
  if (properties) {
    for (const i in properties) {
      graph = updateNodeProperty(graph, { id, value: properties[i], prop: i });
    }
  }
  return graph;
}
export function updateNodePropertyDirty(graph, options) {
  const { id, value, prop } = options;
  if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
    graph.nodeLib[id] = {
      ...graph.nodeLib[id],
      ...{
        dirty: {
          ...(graph.nodeLib[id].dirty || {}),
          [prop]: value
        }
      }
    };
  }
  return graph;
}
export function updateNodeProperty(graph, options) {
  const { id, prop } = options;
  let { value } = options;
  const additionalChange = {};
  if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
    if (prop === NodeProperties.Pinned) {
      if (isFlagged(Flags.HIDE_NEW_NODES)) {
        value = false;
      }
    }
    updateCache({
      prop,
      id,
      value,
      previous: graph.nodeLib[id] && graph.nodeLib[id].properties && graph.nodeLib[id].properties[prop] ? graph.nodeLib[id].properties[prop] : null
    })

    if (NodePropertiesDirtyChain[prop]) {
      const temps = NodePropertiesDirtyChain[prop];
      temps.forEach(temp => {
        if (!graph.nodeLib[id].dirty[temp.chainProp]) {
          additionalChange[temp.chainProp] = temp.chainFunc(
            value,
            graph.nodeLib[id]
          );
        }
      });
    }
    if (fast) {
      if (!graph.nodeLib[id]) {
        graph.nodeLib[id] = {};
      }
      if (!graph.nodeLib[id].dirty) {
        graph.nodeLib[id].dirty = {};
      }
      if (!graph.nodeLib[id].properties) {
        graph.nodeLib[id].properties = {};
      }
      graph.nodeLib[id].dirty[prop] = true
      graph.nodeLib[id].properties[prop] = value;
      Object.assign(graph.nodeLib[id].properties, (additionalChange || {}));
    }
    else {
      graph.nodeLib[id] = {
        ...graph.nodeLib[id],
        ...{
          dirty: {
            [prop]: true,
            ...(graph.nodeLib[id].dirty || {})
          },
          properties: {
            ...(graph.nodeLib[id].properties || {}),
            [prop]: value,
            ...additionalChange
          }
        }
      };
    }
    if (prop === NodeProperties.Selected) {
      graph.selected = graph.selected ? graph.selected + (value ? 1 : -1) : 0;
      if (value) {
        graph.markedSelectedNodeIds = [
          ...(graph.markedSelectedNodeIds || []),
          id
        ].unique();
      } else {
        graph.markedSelectedNodeIds = (graph.markedSelectedNodeIds || []).filter(x => x !== id);
      }
    }
    if (prop === NodeProperties.NODEType && value === NodeTypes.Function) {
      if (fast) {
        if (!graph.functionNodes) {
          graph.functionNodes = {};
        }
        graph.functionNodes[id] = true;
      }
      else {
        graph.functionNodes = { ...graph.functionNodes, ...{ [id]: true } };
      }
    }
    else if (graph.functionNodes[id] && prop === NodeProperties.NODEType) {
      delete graph.functionNodes[id];
      if (!fast) {
        graph.functionNodes = { ...graph.functionNodes };
      }
    }

    if (prop === NodeProperties.NODEType && value === NodeTypes.ClassNode) {
      if (fast) {
        if (!graph.classNodes) {
          graph.classNodes = {};
        }
        graph.classNodes[id] = true;
      }
      else {
        graph.classNodes = { ...graph.classNodes, ...{ [id]: true } };
      }
    } else if (graph.classNodes[id] && prop === NodeProperties.NODEType) {
      delete graph.classNodes[id];
      if (!fast) {
        graph.classNodes = { ...graph.classNodes };
      }
    }
  }
  return graph;
}

export function updateLinkProperty(graph, options) {
  const { id, value, prop } = options;
  if (id && prop && graph.linkLib && graph.linkLib[id]) {
    if (fast) {
      if (!graph.linkLib[id]) { graph.linkLib[id] = {} }

      if (!graph.linkLib[id].properties) { graph.linkLib[id].properties = {}; }

      graph.linkLib[id].properties[prop] = value;
    }
    else {
      graph.linkLib[id] = {
        ...graph.linkLib[id],
        ...{
          properties: {
            ...(graph.linkLib[id].properties || {}),
            [prop]: value
          }
        }
      };
    }
  }
  return graph;
}

export function updateGroupProperty(graph, options) {
  const { id, value, prop } = options;
  if (id && prop && graph.groupLib && graph.groupLib[id]) {
    if (fast) {
      if (!graph.groupLib[id]) {
        graph.groupLib[id] = {};
      }
      if (!graph.groupLib[id].properties) {
        graph.groupLib[id].properties = {};
      }
      graph.groupLib[id].properties[prop] = value;
    }
    else {
      graph.groupLib[id] = {
        ...graph.groupLib[id],
        ...{
          properties: {
            ...(graph.groupLib[id].properties || {}),
            [prop]: value
          }
        }
      };
    }
  }
  return graph;
}

function noSameLink(graph, ops) {
  return !findLink(graph, ops);
  // return !graph.links.some(x => {
  //   const temp = graph.linkLib[x];
  //   return temp && temp.source === ops.source && temp.target === ops.target;
  // });
}
function createGroup() {
  return {
    id: uuidv4(),
    leaves: [],
    groups: [],
    properties: {}
  };
}
function createNode(nodeType) {
  return {
    id: uuidv4(),
    dirty: {},
    properties: {
      text: nodeType || Titles.Unknown
    }
  };
}
function createLink(target, source, properties) {
  properties = properties || {};
  return {
    id: uuidv4(),
    source,
    target,
    properties
  };
}
function copyLink(link) {
  return {
    ...JSON.parse(JSON.stringify(link))
  };
}
export function duplicateNode(nn) {
  return {
    ...nn
  };
}
export function duplicateLink(nn, nodes) {
  return {
    ...nn,
    source: nodes.indexOf(nn.source),
    target: nodes.indexOf(nn.target)
  };
}

function GetNodesInsideGroup(graph, t, seenGroups = {}) {
  let res = Object.keys(graph.groupsNodes[t]);
  for (const i in graph.childGroups[t]) {
    if (!seenGroups[i]) {
      seenGroups = {
        ...seenGroups,
        [i]: true
      };
      res = [...res, ...GetNodesInsideGroup(graph, i, seenGroups)];
    }
  }

  return res;
}
export const GroupImportanceOrder = {
  [NodeTypes.Model]: 1,
  [NodeTypes.Function]: 1,
  [NodeTypes.Method]: 1,
  [NodeTypes.Property]: 4,
  [NodeTypes.ValidationList]: 5,
  [NodeTypes.OptionList]: 6,
  [NodeTypes.Parameter]: 4,
  [NodeTypes.Permission]: 4,
  [NodeTypes.Attribute]: 8,
  [NodeTypes.ValidationList]: 10,
  [NodeTypes.ValidationListItem]: 12,
  [NodeTypes.ModelItemFilter]: 13
};

export function SetVisible(graph) {
  graph.visibleNodes = {};
  graph.nodes.map(t => {
    if (GetNodeProp(GetNode(graph, t), NodeProperties.Pinned)) {
      graph.visibleNodes[t] = true;
    }
  });
  if (graph.depth) {
    [].interpolate(0, graph.depth, x => {
      Object.keys(graph.visibleNodes).map(t => {
        for (const h in graph.nodeLinks[t]) {
          if (x > 1 && !graph.visibleNodes[h]) {
            graph.visibleNodes[h] = 2;
          } else {
            graph.visibleNodes[h] = true;
          }
        }
      });
    });
  }
  return graph;
}
function getDepth(groupId, graph) {
  let res = 0;
  if (graph.groupLib[groupId]) {
    if (graph.parentGroup[groupId]) {
      const parent = Object.keys(graph.parentGroup[groupId])[0];
      if (parent) {
        res += getDepth(parent, graph);
      }
    }
    res += 1;
  }
  return res;
}
export function FilterGraph(graph) {
  const filteredGraph = createGraph();
  filteredGraph.id = graph.id;
  filteredGraph.linkLib = { ...graph.linkLib };
  filteredGraph.nodesGroups = { ...graph.nodesGroups };
  filteredGraph.groupsNodes = { ...graph.groupsNodes };
  filteredGraph.groups = [...graph.groups];
  filteredGraph.groupLib = { ...graph.groupLib };
  filteredGraph.childGroups = { ...graph.childGroups };
  filteredGraph.parentGroup = { ...graph.parentGroup };
  filteredGraph.links = [
    ...graph.links.filter(linkId => {
      const { target, source } = graph.linkLib[linkId];
      if (graph.visibleNodes[target] && graph.visibleNodes[source]) {
        return true;
      }
      delete filteredGraph.linkLib[linkId];

      return false;
    })
  ];
  Object.keys(graph.nodesGroups).map(nodeId => {
    if (!graph.visibleNodes[nodeId]) {
      const temp = graph.nodesGroups[nodeId];
      for (const i in temp) {
        filteredGraph.groupsNodes[i] = { ...filteredGraph.groupsNodes[i] };
        delete filteredGraph.groupsNodes[i][nodeId];
        if (Object.keys(filteredGraph.groupsNodes[i]).length === 0) {
          delete filteredGraph.groupsNodes[i];
        }
      }
      delete filteredGraph.nodesGroups[nodeId];
    }
  });
  Object.keys(filteredGraph.groupLib)
    .sort((b, a) => getDepth(a, graph) - getDepth(b, graph))
    .map(group => {
      if (filteredGraph.groupLib[group].leaves) {
        filteredGraph.groupLib[group] = { ...filteredGraph.groupLib[group] };
        filteredGraph.groupLib[group].leaves = [
          ...filteredGraph.groupLib[group].leaves.filter(
            x => graph.visibleNodes[x]
          )
        ];
        filteredGraph.groupLib[group].groups = [
          ...filteredGraph.groupLib[group].groups.filter(
            x => filteredGraph.groupLib[x]
          )
        ];
        if (
          !filteredGraph.groupLib[group].leaves.length &&
          !filteredGraph.groupLib[group].groups.length
        ) {
          filteredGraph.groups = [
            ...filteredGraph.groups.filter(x => x !== group)
          ];
          delete filteredGraph.groupLib[group];
        }
      }
    });
  Object.keys(graph.childGroups).map(group => {
    if (!filteredGraph.groupsNodes[group]) {
      delete filteredGraph.childGroups[group];
    } else {
      for (const t in filteredGraph.childGroups[group]) {
        if (!filteredGraph.groupsNodes[t]) {
          filteredGraph.childGroups[group] = {
            ...filteredGraph.childGroups[group]
          };
          delete filteredGraph.childGroups[group][t];
        }
      }
    }
  });
  Object.keys(graph.parentGroup).map(group => {
    if (!filteredGraph.groupsNodes[group]) {
      delete filteredGraph.parentGroup[group];
    } else {
      for (const t in filteredGraph.parentGroup[group]) {
        if (!filteredGraph.groupsNodes[t]) {
          filteredGraph.parentGroup[group] = {
            ...filteredGraph.parentGroup[group]
          };
          delete filteredGraph.parentGroup[group][t];
        }
      }
    }
  });
  Object.keys(graph.visibleNodes).map(nodeId => {
    filteredGraph.nodeLib[nodeId] = graph.nodeLib[nodeId];
    filteredGraph.nodes.push(nodeId);
    filteredGraph.nodeConnections[nodeId] = {
      ...graph.nodeConnections[nodeId]
    };
    filteredGraph.nodeLinks[nodeId] = { ...graph.nodeLinks[nodeId] };

    Object.keys(graph.nodeLinks[nodeId] || {}).map(t => {
      if (!filteredGraph.linkLib[t]) {
        filteredGraph.nodeLinks[nodeId] = {
          ...filteredGraph.nodeLinks[nodeId]
        };
        delete filteredGraph.nodeLinks[nodeId][t];
      }
    });
  });

  return filteredGraph;
}
export function VisualProcess(graph) {
  if (Paused()) {
    return null;
  }
  const vgraph = createGraph();
  vgraph.id = graph.id;
  graph = SetVisible(graph);
  vgraph.visibleNodes = { ...graph.visibleNodes };
  graph = FilterGraph(graph);
  const collapsedNodes = graph.nodes.filter(node =>
    GetNodeProp(graph.nodeLib[node], NodeProperties.Collapsed)
  );
  const collapsingGroups = {};
  collapsedNodes.map(t => {
    if (graph.nodesGroups[t]) {
      const t_importance =
        GroupImportanceOrder[
        GetNodeProp(graph.nodeLib[t], NodeProperties.NODEType)
        ] || 1000;
      const sortedGroups = Object.keys(graph.nodesGroups[t])
        .filter(nodeGroupKey => {
          const nodesInGroup = GetNodesInsideGroup(graph, nodeGroupKey);
          const moreImportantNode = nodesInGroup.find(n => {
            if (n === t) {
              return false;
            }
            const _type = GetNodeProp(graph.nodeLib[n], NodeProperties.NODEType);
            const n_importance = GroupImportanceOrder[_type] || 1000;

            if (n_importance > t_importance) {
              return false;
            }
            return true;
          });
          if (moreImportantNode) {
            return false;
          }
          return true;
        })
        .sort((b, a) => (
          Object.keys(graph.groupsNodes[a]).length -
          Object.keys(graph.groupsNodes[b]).length
        ));
      if (sortedGroups.length) {
        collapsingGroups[sortedGroups[0]] = true;
      }
    }
  });
  const smallestsNonCrossingGroups = Object.keys(collapsingGroups).filter(cg => {
    for (const g_ in graph.parentGroup[cg]) {
      if (collapsingGroups[g_]) {
        return false;
      }
    }
    return true;
  });
  let disappearingNodes = {};
  smallestsNonCrossingGroups.map(t => {
    const dt = {};
    let head = null;
    let mostimportant = 10000;
    const _nodes = GetNodesInsideGroup(graph, t);
    _nodes.filter(t => {
      const type = GetGroupProperty(graph.nodeLib[t], NodeProperties.NODEType);
      dt[t] = true;
      if (GroupImportanceOrder[type] < mostimportant) {
        head = t;
        mostimportant = GroupImportanceOrder[type];
      }
    });
    delete dt[head];
    for (const i in dt) {
      dt[i] = head;
    }
    disappearingNodes = { ...disappearingNodes, ...dt };
  });

  vgraph.nodes = [...graph.nodes.filter(x => !disappearingNodes[x])];
  vgraph.nodeLib = {};
  vgraph.nodes.map(t => {
    vgraph.nodeLib[t] = graph.nodeLib[t];
  });
  vgraph.links = graph.links
    .map(x => {
      // Find any link that should be disappearing, and make it go away
      const { source, target } = graph.linkLib[x];
      let dupLink;
      if (disappearingNodes[source] && disappearingNodes[target]) {
        // the link is going totally away;
        return false;
      } if (disappearingNodes[source]) {
        dupLink = copyLink(graph.linkLib[x]);
        dupLink.source = disappearingNodes[source];
        dupLink.id = `${dupLink.source}${dupLink.target}`;
        vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
      } else if (disappearingNodes[target]) {
        dupLink = copyLink(graph.linkLib[x]);
        dupLink.target = disappearingNodes[target];
        dupLink.id = `${dupLink.source}${dupLink.target}`;
        vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
      } else {
        dupLink = copyLink(graph.linkLib[x]);
        dupLink.id = `${dupLink.source}${dupLink.target}`;
        vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
      }
      if (dupLink.source === dupLink.target) {
        return false;
      }
      return dupLink.id;
    })
    .filter(x => x);

  const vgroups = graph.groups
    .map((group, groupIndex) => {
      const oldgroup = graph.groupLib[group];
      const newgroup = createGroup();
      newgroup.id = `${oldgroup.id}`;
      if (oldgroup && oldgroup.leaves) {
        oldgroup.leaves.map(leaf => {
          if (vgraph.nodeLib[leaf]) {
            newgroup.leaves.push(leaf);
          }
        });
      }
      if (newgroup.leaves.length) {
        vgraph.groupLib[newgroup.id] = newgroup;

        return newgroup.id;
      }
      return null;
    })
    .filter(x => x);
  vgroups.map(group => {
    vgraph.groupLib[group].groups = (graph.groupLib[group].groups || []).filter(
      og => {
        if (vgraph.groupLib[og]) {
          return true;
        }
        return false;
      }
    );
  });
  vgraph.groups = vgroups;
  return vgraph;
}
