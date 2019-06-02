import { HandlerEvents } from '../ipc/handler-events';
import { uuidv4 } from '../methods/graph_methods';
import { GetRootGraph } from './uiactions';
const { ipcRenderer } = require('electron');
import path from 'path';

const hub = {};
ipcRenderer.on('message-reply', (event, arg) => {
    console.log(arg) // prints "pong"
    let reply = JSON.parse(arg);
    hub[reply.id].resolve(reply.msg);
    delete hub[reply.id];
})
function message(msg, body) {
    return {
        msg,
        body,
        id: uuidv4()
    }
}
function send(mess, body) {
    var m = message(mess, body);
    hub[m.id] = {};
    let result = Promise.resolve().then(() => {
        return new Promise((resolve, fail) => {
            hub[m.id].resolve = resolve;
            hub[m.id].fail = fail;
        })
    });
    ipcRenderer.send('message', JSON.stringify(m));
    return result;
}

export function scaffoldProject() {
    return (dispatch, getState) => {
        var state = getState();
        let root = GetRootGraph(state);
        send(HandlerEvents.scaffold.message, {
            solutionName: root.title.split(' ').join('.'),
            workspace: path.join(root.workspace, root.title)
        }).then(res => {
            console.log(res)
        });
    }
}