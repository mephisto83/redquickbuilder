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
    graph.nodeLib[node.id] = node;
    graph.nodeLib = { ...graph.nodeLib };
    graph.nodes = [...graph.nodes, node.id];
    graph = { ...graph };
    return graph;
}
export function newLink(graph, options) {
    var { target, source } = options;
    if (target && source) {
        if (graph.nodeLib[target] && graph.nodeLib[source]) {
            if (noSameLink(graph, { target, source })) {
                var link = createLink(target, source);
                graph.linkLib[link.id] = link;
                graph.linkLib = { ...graph.linkLib };
                graph.links = [...graph.links, link.id];
                graph = { ...graph };
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
function createNode() {
    return {
        id: uuidv4()
    }
}
function createLink(target, source) {
    return {
        id: uuidv4(),
        source,
        target
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