import * as Titles from '../components/titles'
import { NodeTypes, NodeTypeColors, NodeProperties, NodePropertiesDirtyChain, DIRTY_PROP_EXT, LinkProperties, LinkType, LinkPropertyKeys, NodePropertyTypes, GroupProperties, FunctionGroups, LinkEvents } from '../constants/nodetypes';
import { Functions, FunctionTemplateKeys, FunctionConstraintKeys, FUNCTION_REQUIREMENT_KEYS, INTERNAL_TEMPLATE_REQUIREMENTS } from '../constants/functiontypes';
import { GetNodeProp, GetLinkProperty, GetNodeTitle, GetGroupProperty } from '../actions/uiactions';
export function createGraph() {
    return {
        id: uuidv4(),
        version: {
            major: 0,
            minor: 0,
            build: 0
        },
        workspace: '',
        title: Titles.DefaultGraphTitle,
        path: [],
        namespace: '',
        //Groups
        groups: [],
        groupLib: {},
        groupsNodes: {}, // group => { node}
        nodesGroups: {}, // node => {group}
        childGroups: {}, // group => {group}
        parentGroup: {}, // group => {group}
        //Groups 
        //Reference nodes
        referenceNodes: {},
        //Reference nodes
        nodeLib: {},
        nodes: [],
        nodeLinks: {}, // A library of nodes, and each nodes that it connects.
        nodeConnections: {}, // A library of nodes, and each nodes links
        linkLib: {},
        links: [],
        graphs: {},
        classNodes: {},
        functionNodes: {}, // A function nodes will be run through for checking constraints.
        updated: null,
        appConfig: {
            "Logging": {
                "IncludeScopes": false,
                "LogLevel": {
                    "Default": "Debug",
                    "System": "Information",
                    "Microsoft": "Information"
                }
            },
            "AppSettings": {
                "Local-AuthorizationKey": "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
                "Local-EndPointUrl": "https://localhost:8081",
                "use_local": "true",
                "EndPointUrl": "",
                "AuthorizationKey": "",
                "DatabaseId": "red-db-001",
                "AssemblyPrefixes": "Smash;RedQuick",
                "Use-SingleCollection": "true",
                "storage-key": "UseDevelopmentStorage=true",
                "single-thread": true
            }
        }
    }
}
export const GraphKeys = {
    NAMESPACE: 'namespace'
}
export function updateWorkSpace(graph, options) {
    let { workspace } = options;
    graph.workspace = workspace;
    return graph;
}

export function incrementBuild(graph) {
    graph.version.build++;
    return graph;
}

export function incrementMinor(graph) {
    graph.version.minor++;
    return graph;
}

export function incrementMajor(graph) {
    graph.version.major++;
    return graph;
}

export function updateGraphTitle(graph, ops) {
    var { text } = ops;
    graph.title = text;
    return graph;
}

export function addNewSubGraph(graph) {
    var newgraph = createGraph();
    newgraph.title = Titles.DefaultSubGraphTitle;
    graph.graphs[newgraph.id] = newgraph;
    return graph;
}
export function removeSubGraph(graph, id) {
    delete graph.graphs[id];
    return graph
}

export function getSubGraphs(graph) {
    return graph && graph.graphs ? Object.keys(graph.graphs || {}).map(t => graph.graphs[t]) : [];
}

export function getSubGraph(graph, scopes) {
    var result = graph;

    scopes.map(scope => {
        result = graph.graphs[scope];
    });

    return result;
}
export function getScopedGraph(graph, options) {
    var { scope } = options;
    if (scope && scope.length) {

        scope.map((s, i) => {
            graph = graph.graphs[s];
        });
    }
    return graph;
}

export function setScopedGraph(root, options) {
    var { scope, graph } = options;
    if (scope && scope.length) {
        var currentGraph = root;
        scope.map((s, i) => {
            if (i === scope.length - 1) {
                currentGraph.graphs[s] = graph;
            } else {
                currentGraph = currentGraph.graphs[s];
            }
        });
    }
    else {
        root = graph;
    }
    return root;
}

export function newGroup(graph, callback) {
    let group = createGroup();
    let result = addGroup(graph, group);
    if (callback) {
        callback(group);
    }
    return result;
}
export function addLeaf(graph, ops) {
    var { leaf, id } = ops;
    let leaves = graph.groupLib[id].leaves || [];
    leaves = [...leaves, leaf].unique(x => x);

    //Groups => nodes
    graph.groupsNodes[id] = graph.groupsNodes[id] || {}
    graph.groupsNodes[id][leaf] = true;
    graph.groupsNodes = {
        ...graph.groupsNodes
    }

    //Nodes => groups
    graph.nodesGroups[leaf] = graph.nodesGroups[leaf] || {}
    graph.nodesGroups[leaf][id] = true;
    graph.nodesGroups = {
        ...graph.nodesGroups
    }



    graph.groupLib[id].leaves = leaves;
    return graph;
}
export function removeLeaf(graph, ops) {
    var { leaf, id } = ops;
    let group = graph.groupLib[id];
    if (group) {
        let leaves = group.leaves || [];
        leaves = [...leaves.filter(t => t !== leaf)];
        graph.groupLib[id].leaves = leaves;
    }
    if (graph.groupsNodes[id]) {
        if (graph.groupsNodes[id][leaf]) {
            delete graph.groupsNodes[id][leaf];
        }
        if (Object.keys(graph.groupsNodes[id]).length === 0) {
            delete graph.groupsNodes[id];
            graph.groups = [...graph.groups.filter(x => x !== id)];
            delete graph.groupLib[id];
        }
        graph.groupsNodes = {
            ...graph.groupsNodes
        }
    }

    if (graph.nodesGroups[leaf]) {
        if (graph.nodesGroups[leaf][id]) {
            delete graph.nodesGroups[leaf][id];
        }
        if (Object.keys(graph.nodesGroups[leaf]).length === 0) {
            delete graph.nodesGroups[leaf];
        }
        graph.nodesGroups = {
            ...graph.nodesGroups
        }
    }


    return graph;
}


export function addGroupToGroup(graph, ops) {
    let { groupId, id } = ops;
    let group = graph.groupLib[id];
    let groups = group.groups || [];

    group.groups = [...groups, groupId].unique(x => x);
    graph.groupLib[id] = group;
    graph.groupLib = { ...graph.groupLib };

    //Groups need to know who contains them,
    graph.childGroups[id] = graph.childGroups[id] || {};
    graph.childGroups[id][groupId] = true;
    // and also the containers to know about the groups
    graph.parentGroup[groupId] = graph.parentGroup[groupId] || {};
    graph.parentGroup[groupId][id] = true;


    return graph;
}
export function removeGroupFromGroup(graph, ops) {
    let { groupId, id } = ops;
    let group = graph.groupLib[id];

    group.groups = [...group.groups.filter(x => x !== groupId)];
    graph.groupLib[id] = { ...group };
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
export function clearGroup(graph, ops) {
    var { id } = ops
    for (let i in graph.groupsNodes[id]) {
        if (graph.nodesGroups[i]) {
            delete graph.nodesGroups[i][id];
            if (Object.keys(graph.nodesGroups[i]).length === 0) {
                delete graph.nodesGroups[i];
            }
        }
    }
    for (let i in graph.childGroups[id]) {
        if (graph.parentGroup[i]) {
            delete graph.parentGroup[i][id]
            if (Object.keys(graph.parentGroup[i]).length === 0) {
                delete graph.parentGroup[i];
            }
        }
    }
    graph.groups = [...graph.groups.filter(x => x !== id)];
    delete graph.groupLib[id]
    delete graph.childGroups[id];
    delete graph.groupsNodes[id];

    return graph;
}
export function createValidator() {
    return {
        properties: {}
    }
}
export const createExecutor = createValidator;

export function createValidatorProperty() {
    return {
        validators: {
        }
    }
}
export function addValidatator(validator, options) {
    validator.properties[options.id] = validator.properties[options.id] || createValidatorProperty();
    if (options.validator)
        validator.properties[options.id].validators[options.validator] = options.validatorArgs;

    return validator;
}
export function removeValidatorValidation(_validator, options) {
    var { property, validator } = options;
    delete _validator.properties[property].validators[validator];

    return _validator;
}
export function removeValidator(validator, options) {
    delete validator.properties[options.id];
    return validator;
}

export function getValidatorItem(item, options) {
    var { property, validator } = options;
    return item.properties[property].validators[validator];
}

export function getValidatorProperties(validator) {
    return validator ? validator.properties : null;
}

export function newNode(graph) {
    let node = createNode();
    return addNode(graph, node);
}
export function createExtensionDefinition() {
    return {
        //The code generation will define the unique 'value'.
        config: {
            //If this definition is a list or some sort of collection.
            isEnumeration: false,
            // If not, then it is a dictionary, and will have some sort of property that will  be considered the value.
            dictionary: {},
            // A list of objects, with the same shape as the dictionary.
            list: []
        },
        definition: {}
    }
}
export function defaultExtensionDefinitionType() {
    return 'string';
}
export function removeNode(graph, options = {}) {
    let { id } = options;
    let existNodes = getNodesByLinkType(graph, { exist: true, id, direction: TARGET, type: LinkType.Exist });

    graph = incrementBuild(graph);
    //links
    graph = clearLinks(graph, options);

    //groups 
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
    graph.nodes = [...graph.nodes.filter(x => x !== id)];
    if (existNodes) {
        existNodes.map(en => {
            graph = removeNode(graph, { id: en.id });
        })
    }
    return graph;
}
function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0;
}
function clearGroupDeep(graph, options) {
    var { id, callback } = options;
    var success = true;
    if (graph.childGroups[id]) {
        for (var i in graph.childGroups[id]) {
            var ok = false;
            graph = clearGroupDeep(graph, {
                id: i,
                callback: (v) => {
                    ok = v;
                    success = success && v;
                }
            })
            delete graph.childGroups[id][i];
        }
    }
    if (success) {
        //If the children were empty this can be cleared out
        if (!graph.groupLib[id] || !graph.groupLib[id].leaves || !graph.groupLib[id].leaves.length) {
            if (!graph.groupLib[id] || !graph.groupLib[id].groups || !graph.groupLib[id].groups.length) {
                //if these conditions are met.
                delete graph.groupLib[id];
                graph.groups = [...graph.groups.filter(x => x !== id)];
                delete graph.childGroups[id];
                if (graph.parentGroup[id]) {
                    for (var i in graph.parentGroup[id]) {
                        graph = removeGroupFromGroup(graph, { groupId: id, id: i });
                        graph = clearGroupDeep(graph, { id: i });
                        if (graph.childGroups[i])
                            delete graph.childGroups[i][id]
                    }
                    delete graph.parentGroup[id];
                }
            }
        }
    }
    else {
        if (callback) {
            callback(false);
        }
    }
    return graph;
}
export function removeNodeFromGroups(graph, options) {
    let { id } = options;
    let groupsContainingNode = [];
    //nodesGroups
    if (graph.nodesGroups[id]) {
        groupsContainingNode = Object.keys(graph.nodesGroups[id]);
        groupsContainingNode.map(group => {
            graph = removeLeaf(graph, { leaf: id, id: group })
        })
    }

    //groupsNodes
    if (graph.groupsNodes) {
        groupsContainingNode.map(group => {
            if (graph.groupsNodes[group]) {
                if (graph.groupsNodes[group][id]) {
                    delete graph.groupsNodes[group][id]
                }

                if (Object.keys(graph.groupsNodes[group]).length === 0) {
                    delete graph.groupsNodes[group];
                }
            }
            graph = clearGroupDeep(graph, { id: group });
        })
    }


    return graph;
}
export function clearLinks(graph, options) {
    let { id } = options;
    let linksToRemove = getAllLinksWithNode(graph, id);
    for (let i = 0; i < linksToRemove.length; i++) {
        let link = linksToRemove[i];
        graph = removeLink(graph, link);
    }
    return graph;

}

export function addNode(graph, node) {
    graph.nodeLib[node.id] = node;
    graph.nodeLib = { ...graph.nodeLib };
    graph.nodes = [...graph.nodes, node.id];
    graph = { ...graph };
    graph = incrementBuild(graph);
    return graph;
}
export function addGroup(graph, group) {
    graph.groupLib[group.id] = group;
    graph.groupLib = { ...graph.groupLib };
    graph.groups = [...graph.groups, group.id].unique(x => x);
    graph = { ...graph };
    return graph;
}

export function addNewPropertyNode(graph, options) {
    return addNewNodeOfType(graph, options, NodeTypes.Property);
}
function updateNode(node, options) {
    if (options.node) {
        Object.apply(node.properties, JSON.parse(JSON.stringify(options.node.properties)));
    }
}
export function addNewNodeOfType(graph, options, nodeType, callback) {
    let { parent, linkProperties, groupProperties } = options;
    let node = createNode(nodeType);
    if (options.node) {
        updateNode(node, options);
        if (nodeType === NodeTypes.ReferenceNode) {
            if (options.rootNode) {
                options.rootNode.referenceNodes[graph.id] = {
                    ...(options.rootNode.referenceNodes[graph.id] || {}),
                    ...({
                        [node.id]: options.node.id
                    })
                }
            }
        }
    }
    graph = addNode(graph, node);
    if (parent) {
        graph = newLink(graph, { source: parent, target: node.id, properties: linkProperties ? linkProperties.properties : null });
    }
    if (options.links) {
        options.links.map(link => {
            graph = newLink(graph, { source: node.id, target: link.target, properties: link.linkProperties ? link.linkProperties.properties : null });
        })
    }
    graph = updateNodeProperty(graph, { id: node.id, prop: NodeProperties.NODEType, value: nodeType });
    if (options.properties) {
        for (var p in options.properties) {
            graph = updateNodeProperty(graph, { id: node.id, prop: p, value: options.properties[p] });
        }
    }
    if (groupProperties) {
        graph = updateNodeGroup(graph, { id: node.id, groupProperties, parent })
    }
    if (callback) {
        callback(node);
    }

    return graph;
}
export function updateNodeGroup(graph, options) {
    var { id, groupProperties, parent } = options;
    var group = null;
    if (!hasGroup(graph, parent)) {
        var group = createGroup();
        graph = addGroup(graph, group);
        graph = updateNodeProperty(graph, {
            id: parent,
            value: { group: group.id },
            prop: NodeProperties.Groups
        });
        graph = addLeaf(graph, { leaf: parent, id: group.id });
        var grandParent = GetNodeProp(graph.nodeLib[parent], NodeProperties.GroupParent);
        if (grandParent && graph.groupLib[grandParent]) {
            var gparentGroup = graph.groupLib[grandParent];
            if (gparentGroup) {
                var ancestores = getGroupAncenstors(graph, gparentGroup.id);
                graph = addGroupToGroup(graph, {
                    id: gparentGroup.id,
                    groupId: group.id
                });
                ancestores.map(anc => {
                    graph = addGroupToGroup(graph, {
                        id: anc,
                        groupId: group.id
                    });
                })
            }
        }
    }
    else {
        let nodeGroupProp = GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups);
        group = getGroup(graph, nodeGroupProp.group);
    }

    if (group) {
        graph = addLeaf(graph, { leaf: id, id: group.id });
        graph = updateNodeProperty(graph, {
            id,
            value: group.id,
            prop: NodeProperties.GroupParent
        });
    }

    return graph;
}
function getGroupAncenstors(graph, id) {
    var result = [];
    if (graph.parentGroup[id]) {
        for (var i in graph.parentGroup[id]) {
            result = [...result, ...getGroupAncenstors(graph, i)];
        }
    }
    return result;
}
function getGroup(graph, id) {
    return graph.groupLib[id];
}
function hasGroup(graph, parent) {
    return !!(graph.nodeLib[parent] && GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups));
}
export function GetNode(graph, id) {
    if (graph && graph.nodeLib) {
        return graph.nodeLib[id];
    }
    return null;
}
export function GetGroup(graph, id) {
    if (graph && graph.groupLib) {
        return graph.groupLib[id];
    }
    return null;
}
export function applyConstraints(graph) {
    let functionNodes = graph.functionNodes;
    if (functionNodes) {
        for (let i in functionNodes) {
            let node = GetNode(graph, i);
            if (node) {
                var functionType = GetNodeProp(node, NodeProperties.FunctionType);
                if (functionType) {
                    var functionConstraintObject = Functions[functionType];
                    if (functionConstraintObject) {
                        graph = checkConstraints(graph, { id: i, functionConstraints: functionConstraintObject });
                    }
                }
            }
        }
    }
    let validationNodes = NodesByType(graph, NodeTypes.Validator);
    validationNodes.map(x => {
        graph = applyValidationNodeRules(graph, x);
    })
    return graph;
}

function applyValidationNodeRules(graph, node) {

    let validator = GetNodeProp(node, NodeProperties.Validator);
    if (validator) {
        var nodesLinks = getNodesLinkedTo(graph, { id: node.id });
        var validatorProperties = getValidatorProperties(validator);
        Object.keys(validatorProperties).map(property => {
            if (graph.nodeLinks[property] && graph.nodeLinks[property][node.id]) {
                //link between nodes exists.
            }
            else {
                //link between nodes exists.
            }
        });
    }
    return graph;
}

function NodesByType(graph, nodeType, options = {}) {

    var currentGraph = graph;
    if (currentGraph) {
        if (!Array.isArray(nodeType)) {
            nodeType = [nodeType];
        }
        return currentGraph.nodes
            .filter(x => currentGraph.nodeLib[x].properties &&
                (nodeType.indexOf(currentGraph.nodeLib[x].properties[NodeProperties.NODEType]) !== -1) ||
                (!options.excludeRefs && currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] === nodeType))
            .map(x => currentGraph.nodeLib[x]);
    }
    return [];
}
export function existsLinkBetween(graph, options) {
    var { source, target, type } = options;
    var link = findLink(graph, { source, target })
    if (link) {
        return GetLinkProperty(link, LinkPropertyKeys.TYPE) === type;
    }
    return false;
}
export function updateReferenceNodes(root) {
    if (root && root.referenceNodes) {
        for (var scope in root.referenceNodes) {
            if (root.graphs && root.graphs[scope]) {
                let scopedGraph = root.graphs[scope];
                for (let nodeId in root.referenceNodes[scope]) {
                    var masterNode = root.nodeLib[root.referenceNodes[scope][nodeId]];
                    if (masterNode) {
                        var refNode = GetNode(scopedGraph, nodeId);
                        if (refNode) {
                            //may be more properties later.
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
    let functionNodes = graph.functionNodes;

    if (functionNodes) {
        let classes_that_must_exist = [];
        for (let i in functionNodes) {
            var function_node = GetNode(graph, i);
            if (function_node) {
                var functionType = GetNodeProp(function_node, NodeProperties.FunctionType);
                if (functionType) {
                    var functionConstraintObject = Functions[functionType];
                    if (functionConstraintObject && functionConstraintObject[FUNCTION_REQUIREMENT_KEYS.CLASSES]) {
                        let functionConstraintRequiredClasses = functionConstraintObject[FUNCTION_REQUIREMENT_KEYS.CLASSES];
                        if (functionConstraintRequiredClasses) {
                            for (let j in functionConstraintRequiredClasses) {
                                //Get the model constraint key.
                                //Should be able to find the singular model that is connected to the functionNode and children, if it exists.
                                let constraintModelKey = functionConstraintRequiredClasses[j][INTERNAL_TEMPLATE_REQUIREMENTS.MODEL];
                                if (constraintModelKey) {
                                    var constraint_nodes = getNodesFunctionsConnected(graph, { id: i, constraintKey: constraintModelKey });
                                    var nodes_one_step_down_the_line = [];
                                    constraint_nodes.map(cn => {
                                        var nextNodes = getNodesLinkedTo(graph, { id: cn.id });
                                        nodes_one_step_down_the_line.push(...nextNodes);
                                    });
                                    nodes_one_step_down_the_line.map(node => {
                                        classes_that_must_exist.push({
                                            nodeId: node.id,
                                            functionNode: function_node.id,
                                            key: constraintModelKey,
                                            class: j
                                        })
                                    })
                                }
                            }
                        }
                    }
                }
            }
            classes_that_must_exist = [...classes_that_must_exist.unique(x => {
                return JSON.stringify(x);
            })]
            //Remove class nodes that are no longer cool.
            Object.keys(graph.classNodes).map(i => {
                if (!classes_that_must_exist.find(cls => {
                    let _cnode = graph.nodeLib[i];
                    var res = GetNodeProp(_cnode, NodeProperties.ClassConstructionInformation);
                    return matchObject(res, cls);
                })) {
                    graph = removeNode(graph, { id: i })
                }
                else {

                }
            });
            //Could make this faster by using a dictionary 
            classes_that_must_exist.map(cls => {
                var matching_nodes = Object.keys(graph.classNodes).filter(i => {

                    let _cnode = graph.nodeLib[i];
                    var res = GetNodeProp(_cnode, NodeProperties.ClassConstructionInformation);
                    if (matchObject(res, cls)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (matching_nodes.length === 0) {
                    //Create new classNodes
                    graph = addNewNodeOfType(graph, {
                        parent: cls.functionNode,
                        linkProperties: {
                            properties: { ...LinkProperties.RequiredClassLink }
                        }
                    }, NodeTypes.ClassNode, (new_node) => {
                        graph = updateNodeProperty(graph, {
                            id: new_node.id,
                            prop: NodeProperties.UIText,
                            value: RequiredClassName(
                                cls.class,
                                GetNodeProp(GetNode(graph, cls.nodeId), NodeProperties.CodeName)
                            )
                        });
                        graph = updateNodeProperty(graph, {
                            id: new_node.id,
                            prop: NodeProperties.ClassConstructionInformation,
                            value: cls
                        });
                    })
                }
                else if (matching_nodes.length === 1) {
                    var _cnode = graph.nodeLib[matching_nodes[0]];
                    //The existing classNodes can be updated with any new dependent values. e.g. Text/title
                    graph = updateNodeProperty(graph, {
                        id: _cnode.id,
                        prop: NodeProperties.UIText,
                        value: RequiredClassName(cls.class, GetNodeProp(GetNode(graph, cls.nodeId), NodeProperties.CodeName))
                    });
                }
                else {
                    console.error('There should never be more than one');
                }
            })
        }
    }

    return graph;
}

export function RequiredClassName(cls, node_name) {
    return `${node_name}${cls}`;
}

export function getNodesFunctionsConnected(graph, options) {
    var { id, constraintKey } = options;
    var result = [];

    let links = getNodeLinksWithKey(graph, { id, key: constraintKey });

    return links.map(link => {
        return graph.nodeLib[link.target];
    })
}


export function checkConstraints(graph, options) {
    var { id, functionConstraints } = options;
    if (graph.nodeConnections[id]) {
        let node = graph.nodeLib[id];
        Object.keys(graph.nodeConnections[id]).map(link => {
            //check if link has a constraint attached.
            let { properties } = graph.linkLib[link];
            let _link = graph.linkLib[link];
            if (properties) {
                let { constraints } = properties;
                if (constraints) {
                    Object.keys(FunctionTemplateKeys).map(ftk => {
                        let functionTemplateKey = FunctionTemplateKeys[ftk]
                        let constraintObj = functionConstraints.constraints[functionTemplateKey];
                        if (constraintObj && _link && _link.properties && _link.properties.constraints && _link.properties.constraints.key) {
                            if (_link.properties.constraints.key === constraintObj.key) {
                                let valid = FunctionMeetsConstraint.meets(constraintObj, constraints, _link, node, graph);
                                graph = updateLinkProperty(graph, {
                                    id: _link.id,
                                    prop: LinkPropertyKeys.VALID_CONSTRAINTS,
                                    value: !!valid
                                })
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
    let { id, value } = options;

    let functionConstraints = Functions[value];
    if (functionConstraints) {
        if (functionConstraints.constraints) {

            if (graph.nodeConnections[id]) {
                getNodeFunctionConstraintLinks(graph, { id }).map(link => {
                    let link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
                    if (!hasMatchingConstraints(link_constraints, functionConstraints.constraints)) {
                        let nodeToRemove = GetTargetNode(graph, link.id);

                        if (nodeToRemove) {
                            graph = removeNode(graph, { id: nodeToRemove.id })
                        }
                        else {
                            console.warn("No nodes were removed as exepected");
                        }
                    }
                });
            }
            let core_group = null;
            let internal_group = null; //Internal scope group
            let external_group = null; //API Group
            let node = graph.nodeLib[id];

            var existingGroups = GetNodeProp(node, NodeProperties.Groups);

            if (existingGroups) {
                for (let i in existingGroups) {
                    graph = clearGroup(graph, { id: existingGroups[i] });
                }
            }

            if (graph.nodesGroups[id]) {
                for (let i in graph.nodesGroups[id]) {
                    switch (GetGroupProperty(graph.groupLib[i], GroupProperties.FunctionGroup)) {
                        case FunctionGroups.Core:
                            core_group = graph.groupLib[i];
                            break;
                    }
                }
            }
            if (!core_group) {
                graph = newGroup(graph, (_group) => {
                    core_group = _group
                    graph = updateGroupProperty(graph, {
                        id: _group.id,
                        prop: GroupProperties.FunctionGroup,
                        value: FunctionGroups.Core
                    });
                });
            }

            if (!internal_group) {
                graph = newGroup(graph, (_group) => {
                    internal_group = _group
                    graph = updateGroupProperty(graph, {
                        id: _group.id,
                        prop: GroupProperties.FunctionGroup,
                        value: FunctionGroups.Internal
                    });
                });
            }

            if (!external_group) {
                graph = newGroup(graph, (_group) => {
                    external_group = _group
                    graph = updateGroupProperty(graph, {
                        id: _group.id,
                        prop: GroupProperties.FunctionGroup,
                        value: FunctionGroups.External
                    });
                });
            }

            if (!graph.groupsNodes[external_group.id] || !graph.groupsNodes[external_group.id][id]) {
                graph = addLeaf(graph, { leaf: id, id: external_group.id })
            }

            if (!graph.childGroups[internal_group.id] || !graph.childGroups[internal_group.id][external_group.id]) {
                graph = addGroupToGroup(graph, { groupId: internal_group.id, id: external_group.id });
            }

            if (!graph.childGroups[core_group.id] || !graph.childGroups[core_group.id][internal_group.id]) {
                graph = addGroupToGroup(graph, { groupId: core_group.id, id: internal_group.id });
            }


            var existMatchinLinks = getNodeFunctionConstraintLinks(graph, { id });
            var constraintKeys = existMatchinLinks.map(link => {
                let link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
                return findMatchingConstraints(link_constraints, functionConstraints.constraints);
            })

            Object.keys(functionConstraints.constraints).map(constraint => {
                //Create links to new nodes representing those constraints.
                if (constraintKeys.indexOf(constraint) === -1) {
                    graph = addNewNodeOfType(graph, {
                        parent: node.id,
                        linkProperties: {
                            properties: {
                                type: LinkType.FunctionConstraintLink,
                                constraints: {
                                    ...functionConstraints.constraints[constraint]
                                }
                            }
                        }
                    }, NodeTypes.Parameter, (new_node) => {
                        graph = updateNodeProperty(graph, { id: new_node.id, prop: NodeProperties.UIText, value: constraint });

                    });
                }
            });

            var nodes_with_link = getNodeFunctionConstraintLinks(graph, { id: node.id });

            nodes_with_link.map((link) => {
                let new_node = graph.nodeLib[link.target];
                var constraint = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
                if (constraint && constraint.key && functionConstraints.constraints[constraint.key] &&
                    functionConstraints.constraints[constraint.key][FunctionConstraintKeys.IsInputVariable]) {
                    graph = addLeaf(graph, { leaf: new_node.id, id: internal_group.id });
                }
                else {
                    graph = addLeaf(graph, { leaf: new_node.id, id: core_group.id })
                }
            });

            if (graph.nodeConnections[id]) {
                Object.keys(graph.nodeConnections[id]).map(link => {
                    //check if link has a constraint attached.
                    let { properties } = graph.linkLib[link];
                    let _link = graph.linkLib[link];
                    if (properties) {
                        let { constraints } = properties;
                        if (constraints) {
                            Object.keys(FunctionTemplateKeys).map(ftk => {
                                let functionTemplateKey = FunctionTemplateKeys[ftk]
                                let constraintObj = functionConstraints.constraints[functionTemplateKey];
                                if (constraintObj && _link && _link.properties && _link.properties.constraints && _link.properties.constraints.key) {
                                    if (_link.properties.constraints.key === constraintObj.key) {
                                        let valid = FunctionMeetsConstraint.meets(constraintObj, constraints, _link, node, graph);
                                        graph = updateLinkProperty(graph, {
                                            id: _link.id,
                                            prop: LinkPropertyKeys.VALID_CONSTRAINTS,
                                            value: !!valid
                                        })
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
            })
        }
    }

    return graph;
}

function getNodeLinksWithKey(graph, options) {
    var { id, key } = options;
    var result = [];
    if (graph.nodeConnections[id]) {
        return Object.keys(graph.nodeConnections[id]).map(link => {
            let _link = graph.linkLib[link];
            return _link;
        }).filter(_link => {
            return _link && _link.source === id && _link.properties && _link.properties.constraints && _link.properties.constraints.key === key;
        })
    }

    return result;
}

function hasMatchingConstraints(linkConstraint, functionConstraints) {
    return !!findMatchingConstraints(linkConstraint, functionConstraints);
}
function findMatchingConstraints(linkConstraint, functionConstraints) {
    let lcj = JSON.stringify(linkConstraint);
    return Object.keys(functionConstraints).find(f => JSON.stringify(functionConstraints[f]) === lcj)
}

function getNodeFunctionConstraintLinks(graph, options) {
    let { id } = options;
    if (graph && graph.nodeConnections && graph.nodeConnections[id]) {
        return Object.keys(graph.nodeConnections[id]).filter(link => {
            return GetLinkProperty(graph.linkLib[link], LinkPropertyKeys.TYPE) === LinkType.FunctionConstraintLink;
        }).map(link => graph.linkLib[link]);
    }

    return [];
}

export const FunctionMeetsConstraint = {
    meets: (constraintObj, constraints, link, node, graph) => {
        if (constraintObj) {
            let _targetNode = graph.nodeLib[link.target];
            var nextNodes = getNodesLinkedTo(graph, { id: _targetNode.id });
            return nextNodes.find(targetNode => {
                return Object.keys(constraintObj).find(constraint => {
                    let result = true;
                    if (result === false) {
                        return;
                    }
                    switch (constraint) {
                        //Instance variable are always ok
                        // case FunctionConstraintKeys.IsInstanceVariable:
                        //     result = true;
                        //     break;
                        case FunctionConstraintKeys.IsAgent:
                            if (targetNode) {
                                if (!GetNodeProp(targetNode, NodeProperties.IsAgent)) {
                                    result = false;
                                }
                            }
                            else {
                                result = false;
                            }
                            break;
                        case FunctionConstraintKeys.IsUser:
                            if (targetNode) {
                                if (!GetNodeProp(targetNode, NodeProperties.IsUser)) {
                                    result = false;
                                }
                            }
                            else {
                                result = false;
                            }
                            break;
                        case FunctionConstraintKeys.IsTypeOf:
                            //If it is an input variable, then we will all anything.
                            if (!constraintObj[FunctionConstraintKeys.IsInputVariable]) {
                                if (targetNode) {
                                    let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
                                    let targetConstraint = constraintObj[constraint] //FunctionConstraintKeys.Model
                                    // The targetNodeType should match the other node.
                                    let linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
                                    if (linkWithConstraints.length) {
                                        let links = linkWithConstraints.filter(linkWithConstraint => {

                                            let nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];;
                                            let nodeToMatchWithType = GetNodeProp(nodeToMatchWith, NodeProperties.NODEType);
                                            return (nodeToMatchWithType !== targetNodeType);
                                        });
                                        if (links.length === 0) {
                                            result = false;
                                        }
                                    }
                                    else {
                                        result = false;
                                    }
                                }
                                else {
                                    result = false;
                                }
                            }
                            break;
                        case FunctionConstraintKeys.IsChild:
                            if (targetNode) {
                                // let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
                                let targetConstraint = constraintObj[constraint] //FunctionConstraintKeys.Model
                                // The targetNodeType should match the other node.
                                let linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
                                if (linkWithConstraints) {
                                    let links = linkWithConstraints.filter(linkWithConstraint => {
                                        let nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];;
                                        let linkToParentParameter = getNodeLinkedTo(graph, { id: nodeToMatchWith.id });
                                        if (linkToParentParameter && linkToParentParameter.length) {
                                            let relationshipLink = findLink(graph, { target: targetNode.id, source: linkToParentParameter[0].id })
                                            if (!relationshipLink || GetLinkProperty(relationshipLink, LinkPropertyKeys.TYPE) !== LinkProperties.ParentLink.type) {
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
                                }
                                else {
                                    result = false;
                                }
                            }
                            else {
                                result = false;
                            }
                            break;
                        case FunctionConstraintKeys.IsParent:
                            if (targetNode) {
                                // let targetNodeType = GetNodeProp(targetNode, NodeProperties.NODEType);
                                let targetConstraint = constraintObj[constraint] //FunctionConstraintKeys.Model
                                // The targetNodeType should match the other node.
                                let linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
                                if (linkWithConstraints) {
                                    let links = linkWithConstraints.filter(linkWithConstraint => {
                                        let nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];;
                                        let linkToParentParameter = getNodeLinkedTo(graph, { id: nodeToMatchWith.id });
                                        if (linkToParentParameter && linkToParentParameter.length) {
                                            let relationshipLink = findLink(graph, { target: targetNode.id, source: linkToParentParameter[0].id })
                                            if (!relationshipLink || GetLinkProperty(relationshipLink, LinkPropertyKeys.TYPE) !== LinkProperties.ParentLink.type) {
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
                                }
                                else {
                                    result = false;
                                }
                            }
                            else {
                                result = false;
                            }
                            break;
                        // case FunctionConstraintKeys.IsParent:
                        //     if (targetNode) {
                        //         let targetConstraint = constraintObj[constraint];
                        //         let linkWithConstraints = findLinkWithConstraint(node.id, graph, targetConstraint);
                        //         if (linkWithConstraints) {
                        //             let links = linkWithConstraints.filter(linkWithConstraint => {
                        //                 let nodeToMatchWith = graph.nodeLib[linkWithConstraint.target];;
                        //                 let linkToParentParameter = getNodesLinkedFrom(graph, { id: nodeToMatchWith.id });
                        //                 if (linkToParentParameter && linkToParentParameter.length) {
                        //                     let relationshipLink = findLink(graph, { target: linkToParentParameter[0].id, source: node.id })
                        //                     if (!relationshipLink || !GetLinkProperty(relationshipLink, LinkProperties.ParentLink.type)) {
                        //                         return false;
                        //                     }
                        //                 }
                        //                 else {
                        //                     return false;
                        //                 }
                        //                 return true;
                        //             });

                        //             if (links.length === 0) {
                        //                 result = false;
                        //             }
                        //         }
                        //         else {
                        //             result = false;
                        //         }
                        //     }
                        //     else {
                        //         result = false;
                        //     }
                        //     break;
                    }

                    return result;
                });
            })
        }

        return false;
    }
}
function findLinkWithConstraint(nodeId, graph, targetConstraint) {
    return Object.keys(graph.nodeConnections[nodeId]).filter(t => graph.nodeConnections[nodeId][t] === SOURCE).filter(link => {
        if (link && graph.linkLib && graph.linkLib[link] && graph.linkLib[link].properties && graph.linkLib[link].properties.constraints
            && graph.linkLib[link].properties.constraints.key === targetConstraint) {
            return graph.linkLib[link];
        }
        return false;
    }).map(link => graph.linkLib[link]);
}
export function getNodeLinks(graph, id, direction) {
    if (graph && graph.nodeConnections) {
        return Object.keys(graph.nodeConnections[id]).filter(x => {
            if (direction) {
                return graph.nodeConnections[id][x] === direction;
            }
            return true;
        }).map(link => graph.linkLib[link]);
    }
    return [];
}
function findLink(graph, options) {
    let { target, source } = options;
    let res = graph.links.find(link => {
        return graph.linkLib && graph.linkLib[link] && graph.linkLib[link].target === target && graph.linkLib[link].source === source;
    });
    if (res) {
        return graph.linkLib[res];
    }
    return null;
}
export function newLink(graph, options) {
    let { target, source, properties } = options;
    let link = createLink(target, source, properties);
    return addLink(graph, options, link);
}

export function GetTargetNode(graph, linkId) {
    if (graph && graph.linkLib && graph.linkLib[linkId]) {
        let target = graph.linkLib[linkId].target;
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
    for (var i in obj1) {
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
    for (var i in obj1) {
        if (obj1[i] !== obj2[i]) {
            return false;
        }
    }

    return true;
}
export function GetLinkByNodes(graph, options) {
    var { source, target } = options;
    return Object.values(graph.linkLib).find(t => {
        return t.source === source && t.target === target;
    })
}
export function getNodesByLinkType(graph, options) {
    if (options) {
        var { id, direction, type, exist } = options;
        if (graph && graph.nodeConnections && id) {
            var nodeLinks = graph.nodeConnections[id];
            if (nodeLinks) {
                return Object.keys(nodeLinks)
                    .filter(x => nodeLinks[x])
                    .map(_id => {
                        var target = graph.linkLib[_id] ? (direction === TARGET ? graph.linkLib[_id].source : graph.linkLib[_id].target) : null;

                        if (!target) {
                            console.warn('Missing value in linkLib');
                            return null;
                        }
                        if (exist && graph.linkLib[_id].properties && graph.linkLib[_id].properties.exist) {
                            return graph.nodeLib[target];
                        }
                        if (!type || graph.linkLib[_id].properties &&
                            graph.linkLib[_id].properties.type === type) {
                            return graph.nodeLib[target];
                        }
                        return null;
                    }).filter(x => x);
            }
        }

    }
}
export function getNodeLinked(graph, options) {
    if (options) {
        var { id, direction, constraints } = options;
        if (graph && graph.nodeConnections && id) {
            var nodeLinks = graph.nodeConnections[id];
            if (nodeLinks) {
                return Object.keys(nodeLinks).filter(x => nodeLinks[x] === direction).map(_id => {
                    var target = graph.linkLib[_id] ? (direction === TARGET ? graph.linkLib[_id].source : graph.linkLib[_id].target) : null;
                    if (!target) {
                        console.warn('Missing value in linkLib');
                        return null;
                    }
                    if (constraints) {
                        let link = graph.linkLib[_id];
                        let link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
                        if (matchOneWay(constraints, link_constraints)) {
                            return graph.nodeLib[target];
                        }
                        else {
                            return null;
                        }
                    }
                    return graph.nodeLib[target];
                }).filter(x => x);
            }
        }
    }
    return [];
}
export const SOURCE = 'SOURCE';
export const TARGET = 'TARGET';
export function addLink(graph, options, link) {
    let { target, source } = options;
    if (target && source && target !== source) {
        if (graph.nodeLib[target] && graph.nodeLib[source]) {
            if (noSameLink(graph, { target, source })) {
                graph.linkLib[link.id] = link;
                graph.linkLib = { ...graph.linkLib };
                graph.links = [...graph.links, link.id];

                //Keeps track of the links for each node.
                graph.nodeConnections[link.source] = {
                    ...(graph.nodeConnections[link.source] || {}),
                    ...{
                        [link.id]: SOURCE
                    }
                }

                //Keeps track of the links for each node.
                graph.nodeConnections[link.target] = {
                    ...(graph.nodeConnections[link.target] || {}),
                    ...{
                        [link.id]: TARGET
                    }
                }

                //Keeps track of the number of links between nodes.
                graph.nodeLinks[link.source] = {
                    ...(graph.nodeLinks[link.source] || {}),
                    ...{
                        [link.target]: graph.nodeLinks[link.source] ? (graph.nodeLinks[link.source][link.target] || 0) + 1 : 1
                    }
                };
                //Keeps track of the number of links between nodes.
                graph.nodeLinks[link.target] = {
                    ...graph.nodeLinks[link.target],
                    ...{
                        [link.source]: graph.nodeLinks[link.target] ? (graph.nodeLinks[link.target][link.source] || 0) + 1 : 1
                    }
                };
            }
            graph.nodeLinks = { ...graph.nodeLinks }
            graph = { ...graph };
        }
    }
    return graph;
}
export function addLinkBetweenNodes(graph, options) {
    let { target, source, properties } = options;
    if (target !== source) {
        let link = createLink(target, source, properties);
        return addLink(graph, options, link);
    }
    return graph;
}
export function findLinkInstance(graph, options) {
    let { target, source } = options;
    let link = graph.links.find(x => graph.linkLib[x].source === source && graph.linkLib[x].target == target);
    return link;
}
export function getAllLinksWithNode(graph, id) {
    return graph.links.filter(x => graph.linkLib[x].source === id || graph.linkLib[x].target === id);
}
export function removeLinkBetweenNodes(graph, options) {
    let link = findLinkInstance(graph, options);
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
    if (link && link.properties && link.properties.on && link.properties.on[LinkEvents.Remove]) {
        link.properties.on[LinkEvents.Remove].map(args => {
            if (args.function && EventFunctions[args.function]) {
                graph = EventFunctions[args.function](graph, link, args.function, args)
            }
        });
    }
    return graph;
}
export function isUIExtensionEnumerable(node) {
    let _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
    if (_node && _node.config) {
        return _node.config.isEnumeration
    }
}
export function GetUIExentionEnumeration(node) {
    if (isUIExtensionEnumerable(node)) {
        let _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
        return _node.config.list;
    }
    return null;
}
export function GetUIExentionKeyField(node) {
    if (isUIExtensionEnumerable(node)) {
        let _node = GetNodeProp(node, NodeProperties.UIExtensionDefinition);
        return _node.config.keyField;
    }
    return null;
}
addEventFunction('OnRemoveValidationPropConnection', (graph, link, func) => {
    var { source, target } = link;
    var node = GetNode(graph, source);
    if (node && node.properties)
        removeValidator(GetNodeProp(node, NodeProperties.Validator), { id: target });
    return graph;
});
addEventFunction('OnRemoveExecutorPropConnection', (graph, link, func) => {
    var { source, target } = link;
    var node = GetNode(graph, source);
    if (node && node.properties)
        removeValidator(GetNodeProp(node, NodeProperties.Executor), { id: target });
    return graph;
});
addEventFunction('OnRemoveValidationItemPropConnection', (graph, link, func, args) => {
    var { source, target } = link;
    var node = GetNode(graph, source);
    var { property, validator } = (args || {});

    let _validator = GetNodeProp(node, NodeProperties.Validator);
    if (node && node.properties &&
        _validator.properties &&
        _validator.properties[property] &&
        _validator.properties[property].validators &&
        _validator.properties[property].validators[validator] &&
        _validator.properties[property].validators[validator].node === target) {
        removeValidatorItem(_validator, { ...args, id: target, });
    }
    return graph;
});

addEventFunction('OnRemoveExecutorItemPropConnection', (graph, link, func, args) => {
    var { source, target } = link;
    var node = GetNode(graph, source);
    var { property, validator } = (args || {});

    let _validator = GetNodeProp(node, NodeProperties.Executor);
    if (node && node.properties &&
        _validator.properties &&
        _validator.properties[property] &&
        _validator.properties[property].validators &&
        _validator.properties[property].validators[validator] &&
        _validator.properties[property].validators[validator].node === target) {
        removeValidatorItem(_validator, { ...args, id: target, });
    }
    return graph;
});


export function removeValidatorItem(_validator, options) {
    var { property, validator } = options;
    delete _validator.properties[property].validators[validator]
}
export function createEventProp(type, options = {}) {
    var res = { on: {} };
    switch (type) {
        case LinkEvents.Remove:
            res.on[type] = [{
                ...options
            }];
            break;
    }

    return res;
}
export function removeLink(graph, link) {
    if (link) {
        graph.links = [...graph.links.filter(x => x !== link)];
        let del_link = graph.linkLib[link];
        if (del_link.properties) {
            if (del_link.properties.on && del_link.properties.on[LinkEvents.Remove]) {
                graph = executeEvents(graph, del_link, LinkEvents.Remove);
            }
        }
        delete graph.linkLib[link]
        graph.linkLib = { ...graph.linkLib };
        graph.nodeLinks[del_link.source] = {
            ...graph.nodeLinks[del_link.source],
            ...{
                [del_link.target]: graph.nodeLinks[del_link.source] ? (graph.nodeLinks[del_link.source][del_link.target] || 0) - 1 : 0
            }
        };
        if (graph.nodeLinks[del_link.source] && !graph.nodeLinks[del_link.source][del_link.target]) {
            delete graph.nodeLinks[del_link.source][del_link.target];
            if (Object.keys(graph.nodeLinks[del_link.source]).length === 0) {
                delete graph.nodeLinks[del_link.source];
            }
        }
        graph.nodeLinks[del_link.target] = {
            ...graph.nodeLinks[del_link.target],
            ...{
                [del_link.source]: graph.nodeLinks[del_link.target] ? (graph.nodeLinks[del_link.target][del_link.source] || 0) - 1 : 0
            }
        };
        if (graph.nodeLinks[del_link.target] && !graph.nodeLinks[del_link.target][del_link.source]) {
            delete graph.nodeLinks[del_link.target][del_link.source];
            if (Object.keys(graph.nodeLinks[del_link.target]).length === 0) {
                delete graph.nodeLinks[del_link.target];
            }
        }

        //Keeps track of the links for each node.
        if (graph.nodeConnections[del_link.source] && graph.nodeConnections[del_link.source][del_link.id]) {
            delete graph.nodeConnections[del_link.source][del_link.id];
        }
        if (Object.keys(graph.nodeConnections[del_link.source]).length === 0) {
            delete graph.nodeConnections[del_link.source];
        }

        //Keeps track of the links for each node.
        if (graph.nodeConnections[del_link.target] && graph.nodeConnections[del_link.target][del_link.id]) {
            delete graph.nodeConnections[del_link.target][del_link.id];
        }
        if (Object.keys(graph.nodeConnections[del_link.target]).length === 0) {
            delete graph.nodeConnections[del_link.target];
        }

    }
    return { ...graph };

}
export function updateNodeText(graph, options) {
    let { id, value } = options;
    if (id && graph.nodeLib && graph.nodeLib[id]) {
        graph.nodeLib[id] = {
            ...graph.nodeLib[id], ...{
                _properties: {
                    ...(graph.nodeLib[id].properties || {}),
                    i: value
                },
                get properties() {
                    return this._properties;
                },
                set properties(value) {
                    this._properties = value;
                },
            }
        }
    }
}
export function updateNodeProperty(graph, options) {
    let { id, value, prop } = options;
    let additionalChange = {};
    if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
        if (NodePropertiesDirtyChain[prop]) {
            let temps = NodePropertiesDirtyChain[prop];
            temps.map(temp => {
                if (!graph.nodeLib[id].dirty[temp.chainProp]) {
                    additionalChange[temp.chainProp] = temp.chainFunc(value);
                }
            });
        }
        graph.nodeLib[id] = {
            ...graph.nodeLib[id], ...{
                dirty: {
                    [prop]: true,
                    ...(graph.nodeLib[id].dirty || {})
                },
                properties: {
                    ...(graph.nodeLib[id].properties || {}),
                    [prop]: value,
                    ...additionalChange,
                }
            }
        }
        if (prop === NodeProperties.NODEType && value === NodeTypes.Function) {
            graph.functionNodes = { ...graph.functionNodes, ...{ [id]: true } };
        }
        else {
            if (graph.functionNodes[id] && prop === NodeProperties.NODEType) {
                delete graph.functionNodes[id];
                graph.functionNodes = { ...graph.functionNodes };
            }
        }

        if (prop === NodeProperties.NODEType && value === NodeTypes.ClassNode) {
            graph.classNodes = { ...graph.classNodes, ...{ [id]: true } };
        }
        else {
            if (graph.classNodes[id] && prop === NodeProperties.NODEType) {
                delete graph.classNodes[id];
                graph.classNodes = { ...graph.classNodes };
            }
        }
    }
    return graph;
}

export function updateLinkProperty(graph, options) {
    let { id, value, prop } = options;
    if (id && prop && graph.linkLib && graph.linkLib[id]) {
        graph.linkLib[id] = {
            ...graph.linkLib[id], ...{
                properties: {
                    ...(graph.linkLib[id].properties || {}),
                    [prop]: value
                }
            }
        }
    }
    return graph;
}

export function updateGroupProperty(graph, options) {
    let { id, value, prop } = options;
    if (id && prop && graph.groupLib && graph.groupLib[id]) {
        graph.groupLib[id] = {
            ...graph.groupLib[id], ...{
                properties: {
                    ...(graph.groupLib[id].properties || {}),
                    [prop]: value
                }
            }
        }
    }
    return graph;
}

function noSameLink(graph, ops) {
    return !graph.links.some(x => {
        let temp = graph.linkLib[x];
        return temp.source === ops.source && temp.target === ops.target;
    })
}
function createGroup() {
    return {
        id: uuidv4(),
        leaves: [],
        groups: [],
        properties: {}
    }
}
function createNode(nodeType) {
    return {
        id: uuidv4(),
        dirty: {

        },
        properties: {
            text: nodeType || Titles.Unknown
        }
    }
}
function createLink(target, source, properties) {
    properties = properties || {};
    return {
        id: uuidv4(),
        source,
        target,
        properties
    }
}
function copyLink(link) {
    return {
        ...(JSON.parse(JSON.stringify(link)))
    }
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

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function GetNodesInsideGroup(graph, t, seenGroups = {}) {
    var res = [...Object.keys(graph.groupsNodes[t])];
    for (var i in graph.childGroups[t]) {
        if (!seenGroups[i]) {
            seenGroups = {
                ...seenGroups,
                [i]: true
            };
            res = [...res, ...GetNodesInsideGroup(graph, i, seenGroups)]
        }
    }

    return res;
}
export const GroupImportanceOrder = {
    [NodeTypes.Model]: 1,
    [NodeTypes.Function]: 1,
    [NodeTypes.Property]: 4,
    [NodeTypes.ValidationList]: 5,
    [NodeTypes.OptionList]: 6,
    [NodeTypes.Parameter]: 4,
    [NodeTypes.Permission]: 4,
    [NodeTypes.Attribute]: 8,
    [NodeTypes.ValidationList]: 10,
    [NodeTypes.ValidationListItem]: 12
}

export function VisualProcess(graph) {
    let vgraph = createGraph();
    vgraph.id = graph.id;
    let collapsedNodes = graph.nodes.filter(node => GetNodeProp(graph.nodeLib[node], NodeProperties.Collapsed));
    let nodesToCheck = [...collapsedNodes];
    let checkedNodes = [];
    let done = true;
    let mashedNodeLib = {};
    let nodeMashedToLib = {};
    let collapsingGroups = {};
    collapsedNodes.map(t => {
        if (graph.nodesGroups[t]) {
            let t_importance = GroupImportanceOrder[GetNodeProp(graph.nodeLib[t], NodeProperties.NODEType)] || 1000;
            var sortedGroups = Object.keys(graph.nodesGroups[t]).filter(nodeGroupKey => {

                let nodesInGroup = GetNodesInsideGroup(graph, nodeGroupKey);
                var moreImportantNode = nodesInGroup.find(n => {
                    if (n === t) {
                        return false;
                    }
                    var _type = GetNodeProp(graph.nodeLib[n], NodeProperties.NODEType);
                    let n_importance = GroupImportanceOrder[_type] || 1000;

                    if (n_importance > t_importance) {
                        return false;
                    }
                    return true;
                });
                if (moreImportantNode) {
                    return false;
                }
                return true;
            }).sort((b, a) => {
                return Object.keys(graph.groupsNodes[a]).length - Object.keys(graph.groupsNodes[b]).length;
            });
            if (sortedGroups.length) {
                collapsingGroups[sortedGroups[0]] = true;
            }
        }
    });
    let smallestsNonCrossingGroups = Object.keys(collapsingGroups).filter(cg => {
        for (var g_ in graph.parentGroup[cg]) {
            if (collapsingGroups[g_]) {
                return false;
            }
        }
        return true;
    });
    let disappearingNodes = {};
    smallestsNonCrossingGroups.map(t => {
        let dt = {};
        let head = null;
        let mostimportant = 10000;
        let _nodes = GetNodesInsideGroup(graph, t);
        _nodes.filter(t => {
            var type = GetGroupProperty(graph.nodeLib[t], NodeProperties.NODEType);
            dt[t] = true;
            if (GroupImportanceOrder[type] < mostimportant) {
                head = t;
                mostimportant = GroupImportanceOrder[type];
            }
        });
        delete dt[head];
        for (var i in dt) {
            dt[i] = head;
        }
        disappearingNodes = { ...disappearingNodes, ...dt };
    });

    // do {
    //     done = true;
    //     let checkedNodesCount = checkedNodes.length;
    //     let nextbatch = [];
    //     let cn = nodesToCheck.map(t => {
    //         let linked_nodes = getNodesByLinkType(graph, { id: t, direction: SOURCE });
    //         if (GetNodeProp(graph.nodeLib[t], NodeProperties.Collapsed)) {
    //             linked_nodes.map(t => {
    //                 graph = updateNodeProperty(graph, {
    //                     id: t.id,
    //                     prop: NodeProperties.Collapsed,
    //                     value: true
    //                 });
    //             });
    //             mashedNodeLib[t] = [...linked_nodes.map(_t => {
    //                 if (_t.id !== t) {
    //                     disappearingNodes[_t.id] = true;
    //                     nodeMashedToLib[_t.id] = t;
    //                 }
    //                 return _t.id;
    //             })];
    //         }
    //         nextbatch.push(...linked_nodes.map(t => t.id));
    //         return t;
    //     });
    //     nodesToCheck = [...nextbatch].unique(x => x);
    //     checkedNodes = [...checkedNodes, ...cn].unique(x => x);
    //     if (checkedNodesCount !== checkedNodes.length) {
    //         done = false;
    //     }
    // } while (!done);

    vgraph.nodes = [...graph.nodes.filter(x => !disappearingNodes[x])]
    vgraph.nodeLib = {};
    vgraph.nodes.map(t => { vgraph.nodeLib[t] = graph.nodeLib[t] });
    vgraph.links = graph.links.map(x => {
        //Find any link that should be disappearing, and make it go away
        var { source, target } = graph.linkLib[x];
        var dupLink;
        if (disappearingNodes[source] && disappearingNodes[target]) {
            // the link is going totally away;
            return false;
        }
        else if (disappearingNodes[source]) {
            dupLink = copyLink(graph.linkLib[x]);
            dupLink.source = disappearingNodes[source];
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        else if (disappearingNodes[target]) {
            dupLink = copyLink(graph.linkLib[x]);
            dupLink.target = disappearingNodes[target];
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        else {
            dupLink = copyLink(graph.linkLib[x]);
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        if (dupLink.source === dupLink.target) {
            return false;
        }
        return dupLink.id;
    }).filter(x => x);

    var vgroups = graph.groups.map((group, groupIndex) => {
        let oldgroup = graph.groupLib[group];
        let newgroup = createGroup();
        newgroup.id = `${oldgroup.id}`;
        if (oldgroup && oldgroup.leaves) {
            oldgroup.leaves.map(leaf => {
                if (vgraph.nodeLib[leaf]) {
                    newgroup.leaves.push(leaf);
                }
            })
        }
        if (newgroup.leaves.length) {
            vgraph.groupLib[newgroup.id] = newgroup;

            return newgroup.id
        }
        return null;
    }).filter(x => x);
    vgroups.map((group) => {
        vgraph.groupLib[group].groups = (graph.groupLib[group].groups || []).filter(og => {
            if (vgraph.groupLib[og]) {
                return true;
            }
            return false;
        })
    })
    vgraph.groups = vgroups;
    return vgraph;
}

export function _VisualProcess(graph) {
    let vgraph = createGraph();
    vgraph.id = graph.id;
    let collapsedNodes = graph.nodes.filter(node => GetNodeProp(graph.nodeLib[node], NodeProperties.Collapsed));
    let nodesToCheck = [...collapsedNodes];
    let checkedNodes = [];
    let done = true;
    let mashedNodeLib = {};
    let nodeMashedToLib = {};
    let disappearingNodes = {};
    do {
        done = true;
        let checkedNodesCount = checkedNodes.length;
        let nextbatch = [];
        let cn = nodesToCheck.map(t => {
            let linked_nodes = getNodesByLinkType(graph, { id: t, direction: SOURCE });
            if (GetNodeProp(graph.nodeLib[t], NodeProperties.Collapsed)) {
                linked_nodes.map(t => {
                    graph = updateNodeProperty(graph, {
                        id: t.id,
                        prop: NodeProperties.Collapsed,
                        value: true
                    });
                });
                mashedNodeLib[t] = [...linked_nodes.map(_t => {
                    if (_t.id !== t) {
                        disappearingNodes[_t.id] = true;
                        nodeMashedToLib[_t.id] = t;
                    }
                    return _t.id;
                })];
            }
            nextbatch.push(...linked_nodes.map(t => t.id));
            return t;
        });
        nodesToCheck = [...nextbatch].unique(x => x);
        checkedNodes = [...checkedNodes, ...cn].unique(x => x);
        if (checkedNodesCount !== checkedNodes.length) {
            done = false;
        }
    } while (!done);

    vgraph.nodes = [...graph.nodes.filter(x => !disappearingNodes[x])]
    vgraph.nodeLib = {};
    vgraph.nodes.map(t => { vgraph.nodeLib[t] = graph.nodeLib[t] });
    vgraph.links = graph.links.map(x => {
        //Find any link that should be disappearing, and make it go away
        var { source, target } = graph.linkLib[x];
        var dupLink;
        if (disappearingNodes[source] && disappearingNodes[target]) {
            // the link is going totally away;
            return false;
        }
        else if (disappearingNodes[source]) {
            dupLink = copyLink(graph.linkLib[x]);
            var orgSource = dupLink.source;
            var nextSource = orgSource;
            do {
                nextSource = nodeMashedToLib[nextSource];
            } while (disappearingNodes[nextSource] && nextSource);
            dupLink.source = nextSource;
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        else if (disappearingNodes[target]) {
            dupLink = copyLink(graph.linkLib[x]);
            var orgSource = dupLink.target;
            var nextSource = orgSource;
            do {
                nextSource = nodeMashedToLib[nextSource];
            } while (disappearingNodes[nextSource] && nextSource);
            dupLink.target = nextSource;
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        else {
            dupLink = copyLink(graph.linkLib[x]);
            dupLink.id = `${dupLink.source}${dupLink.target}`;
            vgraph.linkLib[`${dupLink.source}${dupLink.target}`] = dupLink;
        }
        if (dupLink.source === dupLink.target) {
            return false;
        }
        return dupLink.id;
    }).filter(x => x);

    var vgroups = graph.groups.map((group, groupIndex) => {
        let oldgroup = graph.groupLib[group];
        let newgroup = createGroup();
        newgroup.id = `${oldgroup.id}`;
        if (oldgroup && oldgroup.leaves) {
            oldgroup.leaves.map(leaf => {
                if (vgraph.nodeLib[leaf]) {
                    newgroup.leaves.push(leaf);
                }
            })
        }
        if (newgroup.leaves.length) {
            vgraph.groupLib[newgroup.id] = newgroup;

            return newgroup.id
        }
        return null;
    }).filter(x => x);
    vgroups.map((group) => {
        vgraph.groupLib[group].groups = (graph.groupLib[group].groups || []).filter(og => {
            if (vgraph.groupLib[og]) {
                return true;
            }
            return false;
        })
    })
    vgraph.groups = vgroups;
    return vgraph;
}