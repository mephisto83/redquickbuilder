import * as Titles from '../components/titles'
import { NodeTypes, NodeTypeColors, NodeProperties, NodePropertiesDirtyChain, DIRTY_PROP_EXT } from '../constants/nodetypes';
export function createGraph() {
    return {
        id: uuidv4(),
        nodeLib: {},
        nodes: [],
        nodeLinks: {},
        linkLib: {},
        links: [],
        updated: null
    }
}

export function newNode(graph) {
    var node = createNode();
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
    var { id } = options;

    graph = clearLinks(graph, options);

    delete graph.nodeLib[id];
    graph.nodeLib = { ...graph.nodeLib };
    graph.nodes = [...graph.nodes.filter(x => x !== id)];

    return graph;
}
export function clearLinks(graph, options) {
    var { id } = options;
    var linksToRemove = getAllLinksWithNode(graph, id);
    for (var i = 0; i < linksToRemove.length; i++) {
        var link = linksToRemove[i];
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

export function addNewNodeOfType(graph, options, nodeType) {
    var { parent } = options;
    var node = createNode(nodeType);
    graph = addNode(graph, node);
    if (parent) {
        graph = newLink(graph, { source: parent, target: node.id });
    }
    graph = updateNodeProperty(graph, { id: node.id, prop: NodeProperties.NODEType, value: nodeType })
    return graph;
}

export function newLink(graph, options) {
    var { target, source, properties } = options;
    var link = createLink(target, source, properties);
    return addLink(graph, options, link);
}

export function addLink(graph, options, link) {
    var { target, source } = options;
    if (target && source) {
        if (graph.nodeLib[target] && graph.nodeLib[source]) {
            if (noSameLink(graph, { target, source })) {
                graph.linkLib[link.id] = link;
                graph.linkLib = { ...graph.linkLib };
                graph.links = [...graph.links, link.id];
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
    var { target, source, properties } = options;
    var link = createLink(target, source, properties);
    return addLink(graph, options, link);
}
export function findLinkInstance(graph, options) {
    var { target, source } = options;
    var link = graph.links.find(x => graph.linkLib[x].source === source && graph.linkLib[x].target == target);
    return link;
}
export function getAllLinksWithNode(graph, id) {
    return graph.links.filter(x => graph.linkLib[x].source === id || graph.linkLib[x].target === id);
}
export function removeLinkBetweenNodes(graph, options) {
    var link = findLinkInstance(graph, options);
    return removeLink(graph, link);
}
export function removeLink(graph, link) {
    if (link) {
        graph.links = [...graph.links.filter(x => x !== link)];
        var del_link = graph.linkLib[link];
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
    }
    return { ...graph };

}
export function updateNodeText(graph, options) {
    var { id, value } = options;
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
    var { id, value, prop } = options;
    if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
        if (NodePropertiesDirtyChain[prop]) {
            var additionalChange = {};
            var temps = NodePropertiesDirtyChain[prop];
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
    }
    return graph;
}

function noSameLink(graph, ops) {
    return !graph.links.some(x => {
        var temp = graph.linkLib[x];
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
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}