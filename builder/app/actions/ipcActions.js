import { HandlerEvents } from '../ipc/handler-events';
import { uuidv4 } from '../methods/graph_methods';
import { GetRootGraph } from './uiactions';
const { ipcRenderer } = require('electron');
import path from 'path';
import { GeneratedTypes, NodeTypes } from '../constants/nodetypes';
import Generator from '../generators/generator';
import { fstat, writeFileSync } from 'fs';

const hub = {};
ipcRenderer.on('message-reply', (event, arg) => {
    console.log(arg) // prints "pong"
    let reply = JSON.parse(arg);
    if (hub[reply.id]) {
        hub[reply.id].resolve(reply.msg);
    }
    delete hub[reply.id];
});

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

export function scaffoldProject(filesAndContent) {
    return (dispatch, getState) => {
        var state = getState();
        let root = GetRootGraph(state);
        let solutionName = root.title.split(' ').join('.');
        send(HandlerEvents.scaffold.message, {
            solutionName,
            workspace: path.join(root.workspace, root.title)
        }).then(res => {
            console.log('Finished Scaffolding.');

            generateFiles(path.join(root.workspace, root.title), solutionName, state);
        });
    }
}

function generateFiles(workspace, solutionName, state) {


    var code_types = [
        NodeTypes.Controller,
        NodeTypes.Model,
        NodeTypes.ExtensionType,
        NodeTypes.Maestro,
        ...Object.values(GeneratedTypes)
    ];
    code_types.map(code_type => {

        var temp = Generator.generate({
            type: code_type,
            state
        });
        let area = CodeTypeToArea[code_type];
        path.join();
        for (var fileName in temp) {
            writeFileSync(path.join(workspace, solutionName + area, `${temp[fileName].name}.cs`), temp[fileName].template)
            if (temp[fileName].interface) {
                writeFileSync(path.join(workspace, solutionName + '.Interfaces', `${temp[fileName].iname || fileName}.cs`), temp[fileName].interface);
            }
        }
    })

}

const CodeTypeToArea = {
    [NodeTypes.Controller]: path.join('.Web', 'Controllers'),
    [NodeTypes.Model]: '.Models',
    [NodeTypes.ExtensionType]: '.Models',
    [NodeTypes.Maestro]: '.Controllers',
    [GeneratedTypes.ChangeParameter]: '.Models',
    [GeneratedTypes.ChangeResponse]: '.Models',
    [GeneratedTypes.Constants]: '.Models',
    [GeneratedTypes.Permissions]: '.Controllers',
    [GeneratedTypes.StreamProcess]: '.Controllers',
    [GeneratedTypes.StreamProcessOrchestration]: '.Controllers'

}