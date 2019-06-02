'use strict';

var fs = require('fs');
// import path from 'path';
var path = require('path');
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
    var solutionPath = path.resolve('./' + build.solutionName + '.sln');
    return Promise.resolve().then(() => {
        if (!fs.existsSync('' + build.solutionName + '')) {
            return executeSpawnCmd('dotnet', ['new', 'sln', '--force', '-n', build.solutionName], {});
        }
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'mstest', '--force', '-n', build.solutionName + '.Tests'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'webapi', '--force', '-n', build.solutionName + '.Web'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'classlib', '--force', '-n', build.solutionName + '.Models'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'classlib', '--force', '-n', build.solutionName + '.Interfaces'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'classlib', '--force', '-n', build.solutionName + '.Controllers'], {});
    }).then(() => {
        var projectPath = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['sln', solutionPath, 'add', projectPath], {});

    }).then(() => {
        var projectPath = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['sln', solutionPath, 'add', projectPath], {});

    }).then(() => {
        var projectPath = build.solutionName + '.Models/' + build.solutionName + '.Models.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['sln', solutionPath, 'add', projectPath], {});

    }).then(() => {
        var projectPath = build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['sln', solutionPath, 'add', projectPath], {});

    }).then(() => {
        var projectPath = build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['sln', solutionPath, 'add', projectPath], {});

    }).catch(e => {
        console.log(e);
    });
}
switch (command) {
    case 'createworkspace':
        createWorkSpace();
        break;
}