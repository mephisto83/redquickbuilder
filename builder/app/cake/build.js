'use strict';

var fs = require('fs');
// import path from 'path';
var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn;

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
            console.log('stdout: ' + data);
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

var command = null;
for (let j = 0; j < process.argv.length; j++) {
    console.log(j + ' -> ' + (process.argv[j]));
    if (j === 2) {
        command = process.argv[j];
    }
}

function createWorkSpace() {
    var build = fs.readFileSync('./workspace.json', 'utf-8');
    build = JSON.parse(build);
    return Promise.resolve().then(() => {
        if (fs.existsSync('./' + build.solutionName + '.sln')) {
            return executeSpawnCmd('dotnet', ['new', 'sln', '-n', build.solutionName + '.sln'], {});
        }
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'mstest', '-n', build.solutionName + '.Tests'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'classlib', '-n', build.solutionName + '.Interfaces'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet'['new', 'classlib', '-n', `"${build.solutionName + '.Models'}"`], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'classlib', '-n', build.solutionName + '.Controllers'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'web', '-n', build.solutionName + '.Web'], {});
    }).catch(e => {
        console.log(e);
    });
}
switch (command) {
    case 'createworkspace':
        createWorkSpace();
        break;
}