export function createGraph() {
    return {
        id: uuidv4(),
        nodeLib: {},
        nodes: [],
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
function createNode() {
    return {
        id: uuidv4()
    }
}
export function duplicateNode(nn) {
    return {
        ...nn
    };
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}