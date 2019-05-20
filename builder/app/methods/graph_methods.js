import * as Titles from '../components/titles'
import { NodeTypes, NodeTypeColors, NodeProperties } from '../constants/nodetypes';
export function createGraph() {
    return {
        id: uuidv4(),
        nodeLib: {},
        nodes: [],
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
        config: {},
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
                graph = { ...graph };
            }
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
        delete graph.linkLib[link]
        graph.linkLib = { ...graph.linkLib };
    }
    return { ...graph };

}
export function updateNodeText(graph, options) {
    var { id, value } = options;
    if (id && graph.nodeLib && graph.nodeLib[id]) {
        graph.nodeLib[id] = {
            ...graph.nodeLib[id], ...{
                properties: {
                    ...(graph.nodeLib[id].properties || {}),
                    i: value
                }
            }
        }
    }
}
export function updateNodeProperty(graph, options) {
    var { id, value, prop } = options;
    if (id && prop && graph.nodeLib && graph.nodeLib[id]) {
        graph.nodeLib[id] = {
            ...graph.nodeLib[id], ...{
                properties: {
                    ...(graph.nodeLib[id].properties || {}),
                    [prop]: value
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