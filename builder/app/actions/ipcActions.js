import { HandlerEvents } from '../ipc/handler-events';
import { GraphKeys } from '../methods/graph_methods';
import { GetRootGraph, NodesByType, GetNodeProp, NodeProperties } from './uiactions';
import fs from 'fs';
const { ipcRenderer } = require('electron');
import path from 'path';
import { GeneratedTypes, NodeTypes } from '../constants/nodetypes';
import Generator from '../generators/generator';
import { fstat, writeFileSync } from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { uuidv4 } from '../utils/array';

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

export function scaffoldProject(options = {}) {
    var { filesOnly } = options;
    return (dispatch, getState) => {
        var state = getState();
        let root = GetRootGraph(state);
        let solutionName = root.title.split(' ').join('.');

        ensureDirectory(path.join(root.workspace));
        ensureDirectory(path.join(root.workspace, root.title));
        (filesOnly ? Promise.resolve() : send(HandlerEvents.scaffold.message, {
            solutionName,
            appName: root[GraphKeys.PROJECTNAME] || '',
            workspace: path.join(root.workspace, root.title, 'netcore')
        })).then(() => {
            return (filesOnly ? Promise.resolve() : send(HandlerEvents.reactnative.message, {
                solutionName,
                appName: root[GraphKeys.PROJECTNAME] || '',
                workspace: path.join(root.workspace, root.title, 'reactnative')
            }))
        }).then(res => {
            console.log('Finished Scaffolding.');
            generateFiles(path.join(root.workspace, root.title, 'netcore'), solutionName, state);
        }).then(() => {

            let namespace = root ? root[GraphKeys.NAMESPACE] : null;
            let server_side_setup = root ? root[GraphKeys.SERVER_SIDE_SETUP] : null;
            let userNode = NodesByType(state, NodeTypes.Model).find(x => GetNodeProp(x, NodeProperties.IsUser));
            if (server_side_setup) {

                return generateFolderStructure(path.join(`./app/templates/net_core_mvc/identity/${server_side_setup}`), {
                    model: GetNodeProp(userNode, NodeProperties.CodeName),
                    namespace
                }, null, path.join(path.join(root.workspace, root.title), solutionName + path.join('.Web')));
            }
        });
    }
}
function generateFolderStructure(dir, lib, relative, target_dir) {
    let directories = fs.readdirSync(dir);
    relative = relative || dir;
    directories.map(item => {
        let dirPath = path.join(dir, item);
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
            let reldir = dir.substr(relative.length)
            ensureDirectory(path.join(target_dir, reldir, item));
            generateFolderStructure(dirPath, lib, relative, target_dir);
        }
        else if (fs.existsSync(dirPath)) {
            let file = fs.readFileSync(dirPath, 'utf8');
            let reldir = dir.substr(relative.length)
            file = bindTemplate(file, lib);
            fs.writeFileSync(path.join(target_dir, reldir, item), file, 'utf8');
        }
    })
}
function generateFiles(workspace, solutionName, state) {


    var code_types = [
        NodeTypes.Controller,
        NodeTypes.Model,
        NodeTypes.ExtensionType,
        NodeTypes.Maestro,
        ...Object.values(GeneratedTypes)
    ];
    let root = GetRootGraph(state);
    code_types.map(code_type => {

        var temp = Generator.generate({
            type: code_type,
            state
        });
        let area = CodeTypeToArea[code_type];
        path.join();
        for (var fileName in temp) {
            ensureDirectory(path.join(workspace, solutionName + area))
            writeFileSync(path.join(workspace, solutionName + area, `${temp[fileName].name}.cs`), temp[fileName].template)
            if (temp[fileName].interface) {
                ensureDirectory(path.join(workspace, solutionName + '.Interfaces'))
                writeFileSync(path.join(workspace, solutionName + '.Interfaces', `${temp[fileName].iname || fileName}.cs`), temp[fileName].interface);
            }
            if (temp[fileName].test) {
                ensureDirectory(path.join(workspace, solutionName + '.Tests'))
                writeFileSync(path.join(workspace, solutionName + '.Tests', `${temp[fileName].tname || fileName}.cs`), temp[fileName].test);

            }
        }
    })
    if (root) {
        ensureDirectory(path.join(workspace, solutionName + '.Tests'))
        writeFileSync(path.join(workspace, solutionName + '.Tests', `appsettings.json`), JSON.stringify(root.appConfig, null, 4));
        ensureDirectory(path.join(workspace, solutionName + '.Web'))
        writeFileSync(path.join(workspace, solutionName + '.Web', `appsettings.json`), JSON.stringify(root.appConfig, null, 4));
    }
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log('doesnt exist : ' + dir);
    }
    else {
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    else {
    }
};

const CodeTypeToArea = {
    [NodeTypes.Controller]: path.join('.Web', 'Controllers'),
    [NodeTypes.Model]: '.Models',
    [NodeTypes.ExtensionType]: '.Models',
    [NodeTypes.Maestro]: '.Controllers',
    [GeneratedTypes.ChangeParameter]: '.Models',
    [GeneratedTypes.ChangeResponse]: '.Models',
    [GeneratedTypes.ValidationRule]: '.Models',
    [GeneratedTypes.Executors]: '.Controllers',
    [GeneratedTypes.ModelGet]: '.Controllers',
    [GeneratedTypes.ModelReturn]: '.Controllers',
    [GeneratedTypes.ModelExceptions]: '.Controllers',
    [GeneratedTypes.Constants]: '.Models',
    [GeneratedTypes.Permissions]: '.Controllers',
    [GeneratedTypes.Validators]: '.Controllers',
    [GeneratedTypes.ModelItemFilter]: '.Controllers',
    [GeneratedTypes.StreamProcess]: '.Controllers',
    [GeneratedTypes.StreamProcessOrchestration]: '.Controllers'

}