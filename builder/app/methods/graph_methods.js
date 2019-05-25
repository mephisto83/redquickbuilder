import * as Titles from '../components/titles'
import { NodeTypes, NodeTypeColors, NodeProperties, NodePropertiesDirtyChain, DIRTY_PROP_EXT, LinkProperties, LinkType, LinkPropertyKeys, NodePropertyTypes } from '../constants/nodetypes';
import { Functions, FunctionTemplateKeys, FunctionConstraintKeys, FUNCTION_REQUIREMENT_KEYS, INTERNAL_TEMPLATE_REQUIREMENTS } from '../constants/functiontypes';
import { GetNodeProp, GetLinkProperty, GetNodeTitle } from '../actions/uiactions';
export function createGraph() {
    return {
        id: uuidv4(),
        path: [],
        //Groups
        groups: [],
        groupLib: {},
        groupsNodes: {}, // group => { node}
        nodesGroups: {}, // node => {group}
        groupsGroups: {}, // group => {group}
        //Groups 
        nodeLib: {},
        nodes: [],
        nodeLinks: {}, // A library of nodes, and each nodes that it connects.
        nodeConnections: {}, // A library of nodes, and each nodes links
        linkLib: {},
        links: [],
        graphs: {},
        classNodes: {},
        functionNodes: {}, // A function nodes will be run through for checking constraints.
        updated: null
    }
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
        callback(result);
    }
    return result;
}
export function addLeaf(graph, ops) {
    var { leaf, id } = ops;
    let leaves = graph.groupLib[id].leaves || [];
    leaves = [...leaves, leaf];

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
    let leaves = graph.groupLib[id].leaves || [];
    leaves = [...leaves.filter(t => t !== leaf)];
    graph.groupLib[id].leaves = leaves;

    if (graph.groupsNodes[id]) {
        if (graph.groupsNodes[id][leaf]) {
            delete graph.groupsNodes[id][leaf];
        }
        if (Object.keys(graph.groupsNodes[id]).length === 0) {
            delete graph.groupsNodes[id];
            graph = clearGroup(graph, { id });
        }
        graph.groupsNodes = {
            ...graph.groupsNodes
        }
    }

    if (graph.nodeGroups[leaf]) {
        if (graph.nodeGroups[leaf][id]) {
            delete graph.nodeGroups[leaf][id];
        }
        if (Object.keys(graph.nodeGroups[leaf]).length === 0) {
            delete graph.nodeGroups[leaf];
        }
        graph.nodeGroups = {
            ...graph.nodeGroups
        }
    }


    return graph;
}

export const CONTAINS_GROUP = 'CONTAINS_GROUP';
export const CONTAINED_BY_GROUP = 'CONTAINED_BY_GROUP';
export function addGroupToGroup(graph, ops) {
    let { groupId, id } = ops;
    let group = graph.groupLib[id];
    let groups = group.groups || [];

    group.groups = [...groups, groupId];
    graph.groupLib[id] = group;
    graph.groupLib = { ...graph.groupLib };

    //Groups need to know who contains them,
    graph.groupsGroups[id] = graph.groupsGroups[id] || {};
    graph.groupsGroups[id][groupId] = CONTAINS_GROUP;
    // and also the containers to know about the groups
    graph.groupsGroups[groupId] = graph.groupsGroups[groupId] || {};
    graph.groupsGroups[groupId][id] = CONTAINED_BY_GROUP;


    return graph;
}
export function removeGroupFromGroup(graph, ops) {
    let { groupId, id } = ops;
    let group = graph.groupLib[id];

    group.groups = [...group.groups.filter(x => x !== groupId)];
    graph.groupLib[id] = { ...group };
    if (graph.groupsGroups) {
        if (graph.groupsGroups[id]) {
            delete graph.groupsGroups[id][groupId];
            if (!Object.keys(graph.groupsGroups[id]).length) {
                delete graph.groupsGroups[id];
            }
        }
        graph = clearGroup(graph, { id })
    }

    return graph;
}

export function clearGroup(graph, ops) {
    var { id } = ops
    //If groupsGroups and groupsNodes are empty, then remove the group all together.
    if (!graph.groupsGroups[id] && !graph.groupsNodes[id]) {
        graph.groups = [...graph.groups.filter(x => x !== id)];
        delete graph.groupLib[id]
    }
    return graph;
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

    return graph;
}
export function removeNodeFromGroups(graph, options) {
    let { id } = options;
    let groupsContainingNode = [];
    //nodeGroups
    if (graph.nodeGroups[id]) {
        groupsContainingNode = Object.keys(graph.nodeGroups[id]);
        groupsContainingNode.map(group => {
            graph = removeLeaf(graph, { leaf: id, group })
        })
    }

    //groupNodes
    if (graph.groupNodes) {
        groupsContainingNode.map(group => {
            if (graph.groupNodes[group]) {
                if (graph.groupNodes[group][id]) {
                    delete graph.groupNodes[group][id]
                }
                if (Object.keys(graph.groupNodes[group]).length === 0) {
                    delete graph.groupNodes[group];
                }
            }
        })
    }

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
    return graph;
}
export function addGroup(graph, group) {
    graph.groupLib[group.id] = group;
    graph.groupLib = { ...graph.groupLib };
    graph.groups = [...graph.groups, group.id];
    graph = { ...graph };
    return graph;
}

export function addNewPropertyNode(graph, options) {
    return addNewNodeOfType(graph, options, NodeTypes.Property);
}

export function addNewNodeOfType(graph, options, nodeType, callback) {
    let { parent, linkProperties } = options;
    let node = createNode(nodeType);
    graph = addNode(graph, node);
    if (parent) {
        graph = newLink(graph, { source: parent, target: node.id, properties: linkProperties ? linkProperties.properties : null });
    }
    graph = updateNodeProperty(graph, { id: node.id, prop: NodeProperties.NODEType, value: nodeType });

    if (callback) {
        callback(node);
    }

    return graph;
}
export function GetNode(graph, id) {
    if (graph && graph.nodeLib) {
        return graph.nodeLib[id];
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
    return graph;
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
            let node = graph.nodeLib[id];

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
            var existMatchinLinks = getNodeFunctionConstraintLinks(graph, { id });
            var constraintKeys = existMatchinLinks.map(link => {
                let link_constraints = GetLinkProperty(link, LinkPropertyKeys.CONSTRAINTS);
                return findMatchingConstraints(link_constraints, functionConstraints.constraints);
            })

            Object.keys(functionConstraints.constraints).filter(x => constraintKeys.indexOf(x) === -1).map(constraint => {
                //Create links to new nodes representing those constraints.
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
                    graph = updateNodeProperty(graph, { id: new_node.id, prop: NodeProperties.UIText, value: constraint })
                });

            })


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
    if (graph && graph.linkLib && graph.graphLib && graph.linkLib[linkId]) {
        let target = graph.linkLib[linkId].target;
        return graph.graphLib[target];
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
export function removeLink(graph, link) {
    if (link) {
        graph.links = [...graph.links.filter(x => x !== link)];
        let del_link = graph.linkLib[link];
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

function noSameLink(graph, ops) {
    return !graph.links.some(x => {
        let temp = graph.linkLib[x];
        return temp.source === ops.source && temp.target === ops.target;
    })
}
function createGroup() {
    return {
        id: uuidv4(),
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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}