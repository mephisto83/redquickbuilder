import * as Titles from '../components/titles'
import { NodeTypes, NodeTypeColors, NodeProperties, NodePropertiesDirtyChain, DIRTY_PROP_EXT, LinkProperties, LinkType, LinkPropertyKeys } from '../constants/nodetypes';
import { Functions, FunctionTemplateKeys, FunctionConstraintKeys } from '../constants/functiontypes';
import { GetNodeProp, GetLinkProperty } from '../actions/uiactions';
export function createGraph() {
    return {
        id: uuidv4(),
        nodeLib: {},
        nodes: [],
        nodeLinks: {}, // A library of nodes, and each nodes that it connects.
        nodeConnections: {}, // A library of nodes, and each nodes links
        linkLib: {},
        links: [],
        functionNodes: {}, // A function nodes will be run through for checking constraints.
        updated: null
    }
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

    graph = clearLinks(graph, options);

    delete graph.nodeLib[id];
    graph.nodeLib = { ...graph.nodeLib };
    graph.nodes = [...graph.nodes.filter(x => x !== id)];

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