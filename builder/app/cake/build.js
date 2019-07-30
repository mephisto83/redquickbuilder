'use strict';

var fs = require('fs');
const cheerio = require('cheerio')
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
const appSettingsCopySettings = `
<ItemGroup>
<None Update="appsettings.json">
  <CopyToOutputDirectory>Always</CopyToOutputDirectory>
</None>
</ItemGroup>
`;
function createWorkSpace() {
    var build = fs.readFileSync('./workspace.json', 'utf8');
    build = JSON.parse(build);
    var solutionPath = path.resolve('./' + build.solutionName + '.sln');
    return Promise.resolve().then(() => {
        if (!fs.existsSync('' + build.solutionName + '')) {
            return executeSpawnCmd('dotnet', ['new', 'sln', '--force', '-n', build.solutionName], {});
        }
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'mstest', '--force', '-n', build.solutionName + '.Tests'], {});
    }).then(() => {
        return executeSpawnCmd('dotnet', ['new', 'web', '--force', '-n', build.solutionName + '.Web'], {});
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
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj';
        var relPath = build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj';
        var relPath = build.solutionName + '.Models/' + build.solutionName + '.Models.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        var relPath = build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        var relPath = build.solutionName + '.Models/' + build.solutionName + '.Models.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        var relPath = build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj';
        var relPath = build.solutionName + '.Models/' + build.solutionName + '.Models.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        var relPath = build.solutionName + '.Models/' + build.solutionName + '.Models.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        var relPath = build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        var relPath = build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //dotnet add app/app.csproj reference lib/lib.csproj
        var projectPath = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        var relPath = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        //dotnet sln todo.sln add todo-app/todo-app.csproj
        return executeSpawnCmd('dotnet', ['add', projectPath, 'reference', relPath], {});
    }).then(() => {
        //D:\dev\redquick\RedQuick\RedQuickCore
        //Add nuget packages.
        let source = `D:/dev/redquick/RedQuick/RedQuickCore/bin/Debug`;
        let testProject = build.solutionName + '.Tests/' + build.solutionName + '.Tests.csproj';
        let webProject = build.solutionName + '.Web/' + build.solutionName + '.Web.csproj';
        let projects = [
            build.solutionName + '.Controllers/' + build.solutionName + '.Controllers.csproj',
            build.solutionName + '.Web/' + build.solutionName + '.Web.csproj',
            build.solutionName + '.Models/' + build.solutionName + '.Models.csproj',
            build.solutionName + '.Interfaces/' + build.solutionName + '.Interfaces.csproj',
        ];
        var promise = Promise.resolve();
        let dependencies = [
            'Microsoft.Extensions.Configuration.Json',
            'Microsoft.Extensions.Identity.Core',
            'Autofac',
            'Microsoft.Azure.DocumentDB.Core',
            'Microsoft.Azure.DocumentDB',
            'Moq'];
        projects.map(project => {
            promise = promise.then(() => {
                return executeSpawnCmd('dotnet', ['add', project, 'package', 'RedQuick', '-s', source], {});
            });
        });

        let webProjectDeps = [
        ];

        webProjectDeps.map(dep => {
            promise = promise.then(() => {
                return executeSpawnCmd('dotnet', ['add', webProject, 'package', dep, '-s', source], {});
            });
        })

        dependencies.map(depen => {
            promise = promise.then(() => {
                return executeSpawnCmd('dotnet', ['add', testProject, 'package', depen], {});
            });
        })

        promise = promise.then(() => {
            console.log('updating the tests project output setting');
            let tp = fs.readFileSync(testProject, 'utf8');
            const $ = cheerio.load(tp, {
                xmlMode: true
            });
            var settingsEl = $('[Update="appsettings.json"]');

            if (!settingsEl || settingsEl.length === 0) {
                $('[Sdk="Microsoft.NET.Sdk"]').append(appSettingsCopySettings);
                var res = $.xml();
                fs.writeFileSync(testProject, res, 'utf8');
            }
            console.log('completed the tests project output setting');
        })
        promise = promise.then(() => {
            console.log('updating the webProject output setting');
            let tp = fs.readFileSync(webProject, 'utf8');
            const $ = cheerio.load(tp, {
                xmlMode: true
            });
            var settingsEl = $('[Update="appsettings.json"]');

            if (!settingsEl || settingsEl.length === 0) {
                $('[Sdk="Microsoft.NET.Sdk.Web"]').append(appSettingsCopySettings);
                var res = $.xml();
                fs.writeFileSync(webProject, res, 'utf8');
            }
            console.log('completed the tests project output setting');
        })
        return promise;
    }).catch(e => {
        console.log(e);
        console.log('SOMETHING WENT WRONG');
    });
}
switch (command) {
    case 'createworkspace':
        createWorkSpace();
        break;
}