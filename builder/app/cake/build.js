/* eslint-disable compat/compat */
/* eslint-disable promise/param-names */
/* eslint-disable promise/always-return */



const fs = require('fs')
const cheerio = require('cheerio')
// import path from 'path';
const path = require('path')
const child_process = require('child_process')


const spawn = child_process.spawn

function executeSpawnCmd(cmd, args, options) {
  console.log('execute spawn cmd')
  return new Promise(((resolve, fail) => {
    console.log(cmd)
    console.log(args)
    options = { shell: false, ...(options || {}) }
    let child
    if (process.platform === 'win32') {
      child = spawn(cmd, args, options)
    } else {
      child = spawn('sudo', [cmd].concat(_toConsumableArray(args)), options)
    }
    options._kill = function () {
      child.kill()
    }
    child.stdout.on('data', () => {
      // console.log('stdout: ' + data);
    })

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`)
    })
    child.on('error', (err) => {
      console.log(err)
      child.stdin.pause()
      child.kill()
      fail()
    })
    child.on('exit', (code) => {
      console.log(`child process exited with code ${code}`)
      child.stdin.pause()
      child.kill()
      if (code != 0) {
        console.log(`Failed: ${code}`)
        fail(code)
        return
      }
      resolve()
    })
  }))
}

let command = null
for (let j = 0; j < process.argv.length; j++) {
  console.log(`${j} -> ${process.argv[j]}`)
  if (j === 2) {
    command = process.argv[j]
  }
}
const appSettingsCopySettings = `
<ItemGroup>
<Content Update="appsettings.json">
  <CopyToOutputDirectory>Always</CopyToOutputDirectory>
</Content>
</ItemGroup>
`;

function createReactWeb() {
  let build = fs.readFileSync('./workspace.json', 'utf8')
  build = JSON.parse(build)
  const { appName } = build
  const localDir = path.join(build.workspace)
  console.log(localDir)
  return Promise.resolve()
    .then(() => {
      if (fs.existsSync(`./${appName}`)) {
        return executeSpawnCmd('rimraf', ['-f', `./${appName}`], {
          shell: true,
          cwd: localDir
        })
      }
    })
    .then(() => {
      console.log('cloding creat react app')
      return executeSpawnCmd(
        'npx',
        [
          'create-react-app',
          appName,
          '--template',
          'typescript'
        ],
        {
          shell: true,
          cwd: localDir
        }
      )
    })
    .then(() => {
      console.log('adding redux-logger');
      let promise = Promise.resolve();
      ['@types/react-router', 'react-router-dom', '@types/react-redux', 'typescript@3.8.3', 'node-sass', 'react-redux', 'connected-react-router', 'history', 'react-hot-loader', 'redux', 'react-router', 'redux-logger'].map(dependency => {
        promise = promise.then(() => executeSpawnCmd(
          'yarn',
          [
            'add',
            dependency
          ],
          {
            shell: true,
            cwd: path.join(localDir, appName)
          }
        ));
        return promise
      })
      return promise;
    })
    // /yarn add react-redux
    .then(() => {
      console.log('installing fontawesome')
      console.log(path.join(localDir, appName))
      return executeSpawnCmd('yarn', ['add', '@fortawesome/fontawesome-free'], {
        shell: true,
        cwd: path.join(localDir, appName)
      })
    })
    .catch(e => {
      console.log(e)
      console.log('SOMETHING WENT WRONG - react web')
      throw e
    })
}
function createElectronIO() {
  let build = fs.readFileSync('./workspace.json', 'utf8')
  build = JSON.parse(build)
  const { appName } = build
  const localDir = path.join(build.workspace)
  console.log(localDir)
  return Promise.resolve()
    .then(() => {
      if (fs.existsSync(`./${appName}`)) {
        return executeSpawnCmd('rimraf', ['-f', `./${appName}`], {
          shell: true,
          cwd: localDir
        })
      }
    })
    .then(() => {
      console.log('cloding electron-react-boilerplate')
      return executeSpawnCmd(
        'powershell',
        [
          'git',
          'clone',
          '--depth',
          '1',
          '--single-branch',
          '--branch',
          'master',
          'https://github.com/electron-react-boilerplate/electron-react-boilerplate.git',
          appName
        ],
        {
          shell: true,
          cwd: localDir
        }
      )
    })
    .then(() => {
      // console.log('installing yarn')
      // console.log(path.join(localDir, appName))
      // return executeSpawnCmd('npm', ['install', 'isomorphic-fetch'], {
      //   shell: true,
      //   cwd: path.join(localDir, appName)
      // })
    })
    .then(() => {
      console.log('installing yarn')
      console.log(path.join(localDir, appName))
      return executeSpawnCmd('yarn', ['install'], {
        shell: true,
        cwd: path.join(localDir, appName)
      })
    })
    .then(() => {
      console.log('installing fontawesome')
      console.log(path.join(localDir, appName))
      return executeSpawnCmd('yarn', ['add', '@fortawesome/fontawesome-free'], {
        shell: true,
        cwd: path.join(localDir, appName)
      })
    })

    .then(() => {
      const packagejsonfilepath = path.join(localDir, appName, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagejsonfilepath))
      const devScript = packageJson.scripts.dev
      const port = Math.floor(Math.random() * 30000) + 1000
      packageJson.scripts.dev = devScript.replace(
        /START_HOT=1/g,
        `START_HOT=1 PORT=${port}`
      )
      fs.writeFileSync(packagejsonfilepath, JSON.stringify(packageJson), 'utf8')
    })
    .catch(e => {
      console.log(e)
      console.log('SOMETHING WENT WRONG')
      throw e
    })
}
function createReactNative() {
  let build = fs.readFileSync('./workspace.json', 'utf8')
  build = JSON.parse(build)
  const { appName } = build
  const localDir = path.join(build.workspace, `./${appName}`)
  return Promise.resolve()
    .then(() => executeSpawnCmd('react-native', ['init', appName], {
      cwd: build.workspace,
      shell: true
    }))
    .then(() => executeSpawnCmd('npm', ['install', 'native-base', '--save'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd('react-native', ['link'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd('npm', ['install', 'redux', '--save'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd('npm', ['install', 'react-redux', '--save'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd('npm', ['install', 'redux-thunk', '--save'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd('npm', ['install', 'react-navigation', '--save'], {
      shell: true,
      cwd: localDir
    }))
    .then(() => executeSpawnCmd(
      'npm',
      ['install', 'react-navigation-stack', '--save'],
      {
        shell: true,
        cwd: localDir
      }
    ))
    .then(() => executeSpawnCmd(
      'npm',
      ['install', 'react-navigation-drawer', '--save'],
      {
        shell: true,
        cwd: localDir
      }
    ))
    .then(() => executeSpawnCmd(
      'npm',
      ['install', 'react-native-reanimated', '--save'],
      {
        shell: true,
        cwd: localDir
      }
    ))
    .then(() => executeSpawnCmd(
      'npm',
      ['install', 'react-native-gesture-handler', '--save'],
      {
        shell: true,
        cwd: localDir
      }
    ))
    .then(() => executeSpawnCmd(
      'react-native',
      ['link', 'react-native-gesture-handler'],
      {
        shell: true,
        cwd: localDir
      }
    ))
    .catch(e => {
      console.log(e)
      console.log('SOMETHING WENT WRONG')
    })
}
function createWorkSpace() {
  let build = fs.readFileSync('./workspace.json', 'utf8')
  build = JSON.parse(build)
  const solutionPath = path.resolve(`./${build.solutionName}.sln`)
  return Promise.resolve()
    .then(() => {
      if (!fs.existsSync(`${build.solutionName}`)) {
        return executeSpawnCmd(
          'dotnet',
          ['new', 'sln', '--force', '-n', build.solutionName],
          {}
        )
      }
    })
    .then(() => executeSpawnCmd(
      'dotnet',
      ['new', 'web', '--force', '-n', `${build.solutionName}.Web`],
      {}
    ))
    .then(() => executeSpawnCmd(
      'dotnet',
      ['new', 'mstest', '--force', '-n', `${build.solutionName}.Tests`],
      {}
    ))
    .then(() => executeSpawnCmd(
      'dotnet',
      ['new', 'classlib', '--force', '-n', `${build.solutionName}.Models`],
      {}
    ))
    .then(() => executeSpawnCmd(
      'dotnet',
      [
        'new',
        'classlib',
        '--force',
        '-n',
        `${build.solutionName}.Interfaces`
      ],
      {}
    ))
    .then(() => executeSpawnCmd(
      'dotnet',
      [
        'new',
        'classlib',
        '--force',
        '-n',
        `${build.solutionName}.Controllers`
      ],
      {}
    ))
    .then(() => {
      const projectPath =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['sln', solutionPath, 'add', projectPath],
        {}
      )
    })
    .then(() => {
      const projectPath =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['sln', solutionPath, 'add', projectPath],
        {}
      )
    })
    .then(() => {
      const projectPath =
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['sln', solutionPath, 'add', projectPath],
        {}
      )
    })
    .then(() => {
      const projectPath =
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['sln', solutionPath, 'add', projectPath],
        {}
      )
    })
    .then(() => {
      const projectPath =
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['sln', solutionPath, 'add', projectPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`
      const relPath =
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`
      const relPath =
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      const relPath =
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      const relPath =
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      const relPath =
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      const relPath =
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      const relPath =
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      const relPath =
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      const relPath =
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // dotnet add app/app.csproj reference lib/lib.csproj
      const projectPath =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      const relPath =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      // dotnet sln todo.sln add todo-app/todo-app.csproj
      return executeSpawnCmd(
        'dotnet',
        ['add', projectPath, 'reference', relPath],
        {}
      )
    })
    .then(() => {
      // D:\dev\redquick\RedQuick\RedQuickCore
      // Add nuget packages.
      const source = `D:/dev/redquick/RedQuick/RedQuickCore/bin/Debug`
      const testProject =
        `${build.solutionName}.Tests/${build.solutionName}.Tests.csproj`
      const webProject =
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`
      const projects = [
        `${build.solutionName
        }.Controllers/${
        build.solutionName
        }.Controllers.csproj`,
        `${build.solutionName}.Web/${build.solutionName}.Web.csproj`,
        `${build.solutionName}.Models/${build.solutionName}.Models.csproj`,
        `${build.solutionName
        }.Interfaces/${
        build.solutionName
        }.Interfaces.csproj`
      ]
      let promise = Promise.resolve()
      const dependencies = [
        'Microsoft.Extensions.Configuration.Json',
        'Microsoft.Extensions.Identity.Core',
        'Autofac',
        'Microsoft.Azure.DocumentDB.Core',
        'Microsoft.Azure.DocumentDB',
        'Moq'
      ]
      projects.map(project => {
        promise = promise.then(() => executeSpawnCmd(
          'dotnet',
          ['add', project, 'package', 'RedQuick'],// , '-s', source
          {}
        ))
        promise = promise.then(() => executeSpawnCmd(
          'dotnet',
          ['add', project, 'package', 'Swashbuckle.AspNetCore'],
          {}
        ))
        promise = promise.then(() => executeSpawnCmd(
          'dotnet',
          ['add', project, 'package', 'Microsoft.AspNetCore.StaticFiles'],
          {}
        ))
      })

      const webProjectDeps = []

      webProjectDeps.map(dep => {
        promise = promise.then(() => executeSpawnCmd(
          'dotnet',
          ['add', webProject, 'package', dep, '-s', source],
          {}
        ))
      })

      dependencies.map(depen => {
        promise = promise.then(() => executeSpawnCmd(
          'dotnet',
          ['add', testProject, 'package', depen],
          {}
        ))
      })

      promise = promise.then(() => {
        console.log('updating the tests project output setting')
        const tp = fs.readFileSync(testProject, 'utf8')
        const $ = cheerio.load(tp, {
          xmlMode: true
        })
        const settingsEl = $('[Update="appsettings.json"]')

        if (!settingsEl || settingsEl.length === 0) {
          $('[Sdk="Microsoft.NET.Sdk"]').append(appSettingsCopySettings)
          const res = $.xml()
          fs.writeFileSync(testProject, res, 'utf8')
        }
        console.log('completed the tests project output setting')
      })
      promise = promise.then(() => {
        console.log('updating the webProject output setting')
        const tp = fs.readFileSync(webProject, 'utf8')
        const $ = cheerio.load(tp, {
          xmlMode: true
        })
        const settingsEl = $('[Update="appsettings.json"]')

        if (!settingsEl || settingsEl.length === 0) {
          $('[Sdk="Microsoft.NET.Sdk.Web"]').append(appSettingsCopySettings)
          const res = $.xml()
          fs.writeFileSync(webProject, res, 'utf8')
        }
        console.log('completed the tests project output setting')
      })
      return promise
    })
    .catch(e => {
      console.log(e)
      console.log('SOMETHING WENT WRONG')
    })
}

switch (command) {
  case 'createworkspace':
    createWorkSpace()
    break
  case 'createReactNative':
    createReactNative()
    break
  case 'createElectronIo':
    createElectronIO()
    break
  case 'createReactWeb':
    createReactWeb();
    break;
  default: break;
}
