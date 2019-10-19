import { HandlerEvents } from '../ipc/handler-events';
import { GraphKeys } from '../methods/graph_methods';
import { GetRootGraph, NodesByType, GetNodeProp, NodeProperties, clearPinned, togglePinned, GetDispatchFunc, GetStateFunc, removeCurrentNode, newNode, GetLogicalChildren, GetCodeName, toggleNodeMark } from './uiactions';
import fs from 'fs';
const { ipcRenderer } = require('electron');
import path from 'path';
import { GeneratedTypes, NodeTypes, ReactNativeTypes } from '../constants/nodetypes';
import Generator from '../generators/generator';
import { fstat, writeFileSync } from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { uuidv4 } from '../utils/array';
import { platform } from 'os';
import { saveCurrentGraph, openGraph, toggleContextMenu, setRightMenuTab, newGraph } from './remoteActions';

const hub = {};
ipcRenderer.on('message-reply', (event, arg) => {
    console.log(arg) // prints "pong"
    let reply = JSON.parse(arg);
    if (hub[reply.id]) {
        hub[reply.id].resolve(reply.msg);
    }
    delete hub[reply.id];
});

ipcRenderer.on('commands', (event, arg) => {
    console.log(event);
    console.log(arg);
    switch (arg.args) {
        case 'w':
            clearPinned();
            break;
        case 'p':
            togglePinned();
            break;
        case 'y':
            publishFiles();
            break;
        case 's':
            saveCurrentGraph();
            break;
        case 'o':
            openGraph();
            break;
        case 'n':
            newGraph();
            break;
        case 'm':
            newNode();
            break;
        case 'l':
            toggleContextMenu('layout');
            break;
        case 'k':
            toggleContextMenu('context');
            break;
        case 'x':
            removeCurrentNode();
            break;
        case 'q':
            toggleNodeMark();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            setRightMenuTab(arg.args);
            break;
    }
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
export function publishFiles() {
    scaffoldProject({ filesOnly: true })(GetDispatchFunc(), GetStateFunc());
}

export function scaffoldProject(options = {}) {
    var { filesOnly } = options;
    return (dispatch, getState) => {
        var state = getState();
        let root = GetRootGraph(state);
        let solutionName = root.title.split(' ').join('.');
        let workspace = root.workspaces ? root.workspaces[platform()] || root.workspace : root.workspace;
        ensureDirectory(path.join(workspace));
        ensureDirectory(path.join(workspace, root.title));
        (filesOnly ? Promise.resolve() : send(HandlerEvents.scaffold.message, {
            solutionName,
            appName: root[GraphKeys.PROJECTNAME] || '',
            workspace: path.join(workspace, root.title, 'netcore')
        })).then(() => {
            return (filesOnly ? Promise.resolve() : send(HandlerEvents.reactnative.message, {
                solutionName,
                appName: root[GraphKeys.PROJECTNAME] || '',
                workspace: path.join(workspace, root.title, 'reactnative')
            }))
        }).then(res => {
            console.log('Finished Scaffolding.');
            generateFiles(path.join(workspace, root.title, 'netcore'), solutionName, state);
        }).then(() => {
            console.log('generate react-native files');
            generateReactNative(path.join(workspace, root.title, 'reactnative', root[GraphKeys.PROJECTNAME]), state);
        }).then(() => {

            let namespace = root ? root[GraphKeys.NAMESPACE] : null;
            let server_side_setup = root ? root[GraphKeys.SERVER_SIDE_SETUP] : null;
            let userNode = NodesByType(state, NodeTypes.Model).find(x => GetNodeProp(x, NodeProperties.IsUser));
            let logicalChildren = GetLogicalChildren(userNode.id);
            if (server_side_setup) {
                let children = logicalChildren.map(child => {
                    return `
            if (string.IsNullOrEmpty(user.${GetCodeName(child.id)}))
                result.Add(new Claim("${GetCodeName(child.id)}", user.${GetCodeName(child.id)}));
            `
                }).join('');
                generateFolderStructure(path.join(`./app/templates/net_core_mvc/identity/${server_side_setup}`), {
                    model: GetNodeProp(userNode, NodeProperties.CodeName),
                    namespace
                }, null, path.join(path.join(workspace, root.title, 'netcore'), solutionName + path.join('.Web')))

                generateFolderStructure(path.join(`./app/templates/net_core_mvc/identity/RedQuickControllers`), {
                    model: GetNodeProp(userNode, NodeProperties.CodeName),
                    namespace,
                    children
                }, null, path.join(path.join(workspace, root.title, 'netcore'), solutionName + path.join('.Controllers')))

            }
        }).then(() => {
            console.log('Write react-native files')
            let appName = root[GraphKeys.PROJECTNAME];
            let version = 'v1';
            if (appName) {
                return generateFolderStructure(path.join(`./app/templates/react_native/${version}`), {

                }, null, path.join(workspace, root.title, 'reactnative', appName));
            }
            else {
                console.warn('No app name given');
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
function generateReactNative(workspace, state) {
    let code_types = [...Object.values(ReactNativeTypes)];
    let root = GetRootGraph(state);

    code_types.map(code_type => {
        let temp = Generator.generate({
            type: code_type,
            state
        });

        for (var fileName in temp) {
            ensureDirectory(path.join(workspace, temp[fileName].relative));
            writeFileSync(path.join(workspace, temp[fileName].relative, `${temp[fileName].relativeFilePath}`), temp[fileName].template)
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
    let _dir_parts = dir.split(path.sep);
    _dir_parts.map((_, i) => {
        if (i > 1 || _dir_parts.length - 1 === i) {
            let tempDir = path.join(..._dir_parts.subset(0, i + 1));
            if (dir.startsWith(path.sep)) {
                tempDir = `${path.sep}${tempDir}`;
            }
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
        }
    })
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