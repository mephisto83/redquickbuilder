// In main process.
const { ipcMain } = require('electron');
import { HandlerEvents } from './ipc/handler-events';
import fs from 'fs';
import path from 'path';
var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn;

export default class IPCHandlers {

    static setup() {
        ipcMain.on('message', (event, arg) => {
            console.log(arg) // prints "ping"
            let msg = JSON.parse(arg);
            handle(msg).then(res => {
                event.sender.send('message-reply', JSON.stringify({
                    id: msg.id,
                    body: res
                }))
            });
        });
    }
}
function handle(msg) {
    let message = msg.msg;
    let result = Promise.resolve();

    switch (message) {
        case HandlerEvents.scaffold.message:
            result = Promise.resolve().then(() => {
                return scaffoldProject(msg.body);
            })
            console.log('handle scaffolding');
            break;
        default:
            console.log('did nothing');
            break;
    }

    return result;
}

function scaffoldProject(body) {
    let { workspace } = body;
    return ensureDirectory(workspace).then(() => {
        return copyFile(`./app/cake/build.cake`, path.join(workspace, 'build.cake'));
    }).then(() => {
        return copyFile(`./app/cake/build.ps1`, path.join(workspace, 'build.ps1'));
    }).then(() => {
        return executeSpawnCmd('powershell', ['./build.ps1', '-Target', 'CreateWorkSpace', `-WorkSpace=${workspace}`], { cwd: workspace })
    }).then(() => {
        console.log('Scaffoled the project successfully');
        return true;
    }).catch((e) => {
        console.log('Failed to scaffold');
        return false;
    })
}

function copyFile(source, destination) {
    return new Promise((resolve, fall) => {
        // destination.txt will be created or overwritten by default.
        console.log(`copying ${source} to ${destination}`)
        fs.copyFile(source, destination, (err) => {
            if (err) {
                console.log(err);
                fail(err)
            }
            else {
                resolve();
            }
            console.log('source.txt was copied to destination.txt');
        });
    });
}
function ensureDirectory(dir) {
    return new Promise(function (resolve, fail) {
        if (!fs.existsSync(dir)) {
            console.log('doesnt exist : ' + dir);
        }
        else {
            resolve();
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            resolve();
        }
        else {
            fail();
        }
    });
};

function executeSpawnCmd(cmd, args, options) {
    console.log('execute spawn cmd');
    return new Promise(function (resolve, fail) {
        console.log(cmd);
        console.log(args);
        options = { ... (options || {}), shell: false }
        var child;
        if (process.platform === 'win32') {
            child = spawn(cmd, args, options);
        } else {
            child = spawn('sudo', [cmd].concat(_toConsumableArray(args)), options);
        }
        options._kill = function () {
            child.kill();
        };
        child.stdout.on('data', function (data) {
            // console.log('stdout: ' + data);
        });

        child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        child.on('error', function (err) {
            console.log(err);
            child.stdin.pause();
            child.kill();
            fail();
        });
        child.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            child.stdin.pause();
            child.kill();
            if (code != 0) {
                console.log('Failed: ' + code);
                fail(code);
                return;
            }
            resolve();
        });
    });
}