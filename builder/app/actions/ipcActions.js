import { HandlerEvents } from "../ipc/handler-events";
import {
  GraphKeys,
  getNodesByLinkType,
  TARGET,
  SOURCE,
  GetNodesLinkedTo
} from "../methods/graph_methods";
import {
  GetRootGraph,
  NodesByType,
  GetNodeProp,
  NodeProperties,
  clearPinned,
  togglePinned,
  GetDispatchFunc,
  GetStateFunc,
  removeCurrentNode,
  newNode,
  GetLogicalChildren,
  GetCodeName,
  toggleNodeMark,
  setInComponentMode,
  GetModelPropertyChildren,
  GetMethodsProperties,
  GetMethodProps,
  GetMaestroNode,
  GetControllerNode
} from "./uiactions";
import fs from "fs";
const { ipcRenderer } = require("electron");
import path from "path";
import {
  GeneratedTypes,
  NodeTypes,
  ReactNativeTypes,
  UITypes,
  LinkType,
  NEW_LINE,
  NodeAttributePropertyTypes
} from "../constants/nodetypes";
import Generator from "../generators/generator";
import { fstat, writeFileSync } from "fs";
import {
  bindTemplate,
  FunctionTemplateKeys,
  ReturnTypes
} from "../constants/functiontypes";
import { uuidv4 } from "../utils/array";
import { platform } from "os";
import {
  saveCurrentGraph,
  openGraph,
  toggleContextMenu,
  setRightMenuTab,
  newGraph,
  toggleVisualKey
} from "./remoteActions";
import ThemeServiceGenerator from "../generators/themeservicegenerator";

const hub = {};
ipcRenderer.on("message-reply", (event, arg) => {
  console.log(arg); // prints "pong"
  let reply = JSON.parse(arg);
  if (hub[reply.id]) {
    hub[reply.id].resolve(reply.msg);
  }
  delete hub[reply.id];
});

ipcRenderer.on("commands", (event, arg) => {
  console.log(event);
  console.log(arg);
  switch (arg.args) {
    case "w":
      clearPinned();
      break;
    case "p":
      togglePinned();
      break;
    case "y":
      publishFiles();
      break;
    case "s":
      saveCurrentGraph();
      break;
    case "e":
      setInComponentMode();
      break;
    case "o":
      openGraph();
      break;
    case "n":
      newGraph();
      break;
    case "m":
      newNode();
      break;
    case "l":
      toggleContextMenu("layout");
      break;
    case "g":
      toggleVisualKey("GROUPS_ENABLED");
      break;
    case "k":
      toggleContextMenu("context");
      break;
    case "x":
      removeCurrentNode();
      break;
    case "q":
      toggleNodeMark();
      break;
    case "1":
    case "2":
    case "3":
    case "4":
      setRightMenuTab(arg.args);
      break;
  }
});

function message(msg, body) {
  return {
    msg,
    body,
    id: uuidv4()
  };
}
function send(mess, body) {
  var m = message(mess, body);
  hub[m.id] = {};
  let result = Promise.resolve().then(() => {
    return new Promise((resolve, fail) => {
      hub[m.id].resolve = resolve;
      hub[m.id].fail = fail;
    });
  });
  ipcRenderer.send("message", JSON.stringify(m));
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
    let solutionName = root.title.split(" ").join(".");
    let workspace = root.workspaces
      ? root.workspaces[platform()] || root.workspace
      : root.workspace;
    ensureDirectory(path.join(workspace));
    ensureDirectory(path.join(workspace, root.title));
    (filesOnly
      ? Promise.resolve()
      : send(HandlerEvents.scaffold.message, {
          solutionName,
          appName: root[GraphKeys.PROJECTNAME] || "",
          workspace: path.join(workspace, root.title, "netcore")
        })
    )
      .then(() => {
        return filesOnly
          ? Promise.resolve()
          : send(HandlerEvents.reactnative.message, {
              solutionName,
              appName: root[GraphKeys.PROJECTNAME] || "",
              workspace: path.join(workspace, root.title, "reactnative")
            });
      })
      .then(() => {
        return filesOnly
          ? Promise.resolve()
          : send(HandlerEvents.electron.message, {
              solutionName,
              appName: root[GraphKeys.PROJECTNAME] || "",
              workspace: path.join(workspace, root.title, "electronio")
            });
      })
      .then(res => {
        console.log("Finished Scaffolding.");
        generateFiles(
          path.join(workspace, root.title, "netcore"),
          solutionName,
          state
        );
      })
      .then(() => {
        console.log("generate react-native files");
        generateReactNative(
          path.join(
            workspace,
            root.title,
            "reactnative",
            root[GraphKeys.PROJECTNAME]
          ),
          state
        );
      })
      .then(() => {
        console.log("generate electron io files");
        generateElectronIO(
          path.join(
            workspace,
            root.title,
            "electronio",
            root[GraphKeys.PROJECTNAME]
          ),
          state
        );
      })
      .then(() => {
        let namespace = root ? root[GraphKeys.NAMESPACE] : null;
        let server_side_setup = root ? root[GraphKeys.SERVER_SIDE_SETUP] : null;
        let graph = root;
        let userNode = NodesByType(state, NodeTypes.Model).find(x =>
          GetNodeProp(x, NodeProperties.IsUser)
        );
        let logicalParents = GetNodesLinkedTo(graph, {
          id: userNode.id,
          link: LinkType.UserLink
        }).filter(x => x.id !== userNode.id);
        let logicalChildren = GetLogicalChildren(userNode.id);
        if (server_side_setup) {
          let children = [
            ...logicalChildren,
            ...logicalParents,
            ...GetModelPropertyChildren(userNode.id).filter(
              x =>
                GetNodeProp(x, NodeProperties.UIAttributeType) ===
                NodeAttributePropertyTypes.STRING
            )
          ]
            .unique(x => x.id)
            .filter(x => GetCodeName(x) !== "Id")
            .filter(x => GetCodeName(x) !== "UserName")
            .map(child => {
              return `
            if (!string.IsNullOrEmpty(user.${GetCodeName(child.id)}))
                result.Add(new Claim("${GetCodeName(
                  child.id
                )}", user.${GetCodeName(child.id)}));
            `;
            })
            .join("");
          generateFolderStructure(
            path.join(
              `./app/templates/net_core_mvc/identity/${server_side_setup}`
            ),
            {
              maestro_registrations: CreateRegistrations(
                NodesByType(null, NodeTypes.Maestro).filter(
                  x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration)
                )
              ),
              permission_registrations: CreateRegistrations(
                NodesByType(null, NodeTypes.Model).filter(x =>
                  GetNodeProp(x, NodeProperties.IsAgent)
                ),
                v => `Permissions${GetCodeName(v)}`,
                v => `IPermissions${GetCodeName(v)}`
              ),
              executor_registrations: CreateRegistrations(
                NodesByType(null, NodeTypes.Model).filter(x =>
                  GetNodeProp(x, NodeProperties.IsAgent)
                ),
                v => `${GetCodeName(v)}Executor`,
                v => `I${GetCodeName(v)}Executor`
              ),
              orchestration_registrations:CreateRegistrations(
                NodesByType(null, NodeTypes.Model).filter(x =>
                  GetNodeProp(x, NodeProperties.IsAgent)
                ),
                v => `${GetCodeName(v)}StreamProcessOrchestration`,
                v => `I${GetCodeName(v)}StreamProcessOrchestration`
              ),
              validation_registrations:CreateRegistrations(
                NodesByType(null, NodeTypes.Model).filter(x =>
                  GetNodeProp(x, NodeProperties.IsAgent)
                ),
                v => `${GetCodeName(v)}Validations`,
                v => `I${GetCodeName(v)}Validations`
              ),
              model: GetNodeProp(userNode, NodeProperties.CodeName),
              namespace
            },
            null,
            path.join(
              path.join(workspace, root.title, "netcore"),
              solutionName + path.join(".Web")
            )
          );
          let more_interfaces = "";
          let interface_implementations = [];
          let user_update_implementation = [];
          let post_registrations = [];
          let claim_service_interfaces = "";
          let user_node = null;
          let template_name = "ICreateAgents";
          let interfaceFunctions = NodesByType(state, NodeTypes.ClaimService)
            .map(claimService => {
              let authMethods = GetNodesLinkedTo(graph, {
                id: claimService.id,
                link: LinkType.ClaimServiceAuthorizationMethod
              });
              let userUpdateMethods = GetNodesLinkedTo(graph, {
                id: claimService.id,
                link: LinkType.ClaimServiceUpdateUserMethod
              });
              userUpdateMethods.map(method => {
                let parameters = GetMethodProps(method);
                if (parameters && parameters[FunctionTemplateKeys.Model]) {
                  let model = GetCodeName(
                    parameters[FunctionTemplateKeys.Model]
                  );
                  let user = GetCodeName(parameters[FunctionTemplateKeys.User]);
                  let maestro = GetMaestroNode(method.id);
                  if (maestro) {
                    let controller = GetControllerNode(maestro.id);
                    if (controller) {
                      user_node = user;
                      user_update_implementation.push(`
  var maestro = RedStrapper.Resolve<I${GetCodeName(maestro)}>();
  user = await maestro.${GetCodeName(method)}(user, user);
                      `);
                    }
                  }
                }
              });
              return authMethods
                .map(method => {
                  let parameters = GetMethodProps(method);
                  if (parameters && parameters[FunctionTemplateKeys.Model]) {
                    let model = GetCodeName(
                      parameters[FunctionTemplateKeys.Model]
                    );
                    let user = GetCodeName(
                      parameters[FunctionTemplateKeys.User]
                    );
                    let maestro = GetMaestroNode(method.id);
                    if (maestro) {
                      let controller = GetControllerNode(maestro.id);
                      if (controller) {
                        user_node = user;
                        interface_implementations.push(`
                    public async Task<${model}> Create(${user} user, ${model} model)
                    {
                      var maestro = RedStrapper.Resolve<I${GetCodeName(
                        maestro
                      )}>();
                      return await maestro.${GetCodeName(method)}(user, model);
                    }`);
                        post_registrations.push(`
                    var  ${model.toLowerCase()} =  ${model}.Create();
                    ${model.toLowerCase()}.Owner = user.Id;
                    ${model.toLowerCase()} = await Create(user, ${model.toLowerCase()});
                    user.${model}  = ${model.toLowerCase()}.Id;`);
                        return `Task<${model}> Create(${user} ${
                          FunctionTemplateKeys.User
                        }, ${model} ${FunctionTemplateKeys.Model});`;
                      }
                    }
                  }
                  return null;
                })
                .filter(x => x);
            })
            .flatten()
            .unique();

          if (interfaceFunctions && interfaceFunctions.length) {
            interface_implementations.push(`

public async Task<User> Update(User user)
{
${user_update_implementation.join(NEW_LINE)}
  return user;
}

public async Task<${user_node}> PostRegistration(${user_node} user)
{
${post_registrations.join(NEW_LINE)}

    user = await Update(user);

    return user;
} `);
            claim_service_interfaces = `public interface ${template_name} {
${interfaceFunctions.join(NEW_LINE)}
}`;
            more_interfaces = `, ${template_name}`;
          }
          let props = [
            ...logicalParents,
            ...GetModelPropertyChildren(userNode.id).filter(
              x =>
                GetNodeProp(x, NodeProperties.UIAttributeType) ===
                NodeAttributePropertyTypes.STRING
            )
          ]
            .map(prop => {
              return GetCodeName(prop);
            })
            .unique()
            .map(v => {
              return `if (claim.Type == "${v}")
              {
                result.${v} = claim.Value;
              }`;
            })
            .join(NEW_LINE);

          generateFolderStructure(
            path.join(
              `./app/templates/net_core_mvc/identity/RedQuickControllers`
            ),
            {
              model: GetNodeProp(userNode, NodeProperties.CodeName),
              namespace,
              children,
              more_interfaces,
              interface_implementations: interface_implementations.join(
                NEW_LINE
              ),
              claim_service_interfaces,
              create_properties: props
            },
            null,
            path.join(
              path.join(workspace, root.title, "netcore"),
              solutionName + path.join(".Controllers")
            )
          );

          generateFolderStructure(
            path.join(
              `./app/templates/net_core_mvc/identity/RedQuickTests`
            ),
            {
              namespace
            },
            null,
            path.join(
              path.join(workspace, root.title, "netcore"),
              solutionName + path.join(".Tests")
            )
          );
        }
      })
      .then(() => {
        console.log("Write react-native files");
        let appName = root[GraphKeys.PROJECTNAME];
        let version = "v1";
        if (appName) {
          return generateFolderStructure(
            path.join(`./app/templates/react_native/${version}`),
            {},
            null,
            path.join(workspace, root.title, "reactnative", appName)
          );
        } else {
          console.warn("No app name given");
        }
      })
      .then(() => {
        console.log("Write electron files");
        let appName = root[GraphKeys.PROJECTNAME];
        let version = "v1";
        if (appName) {
          return generateFolderStructure(
            path.join(`./app/templates/electronio/${version}`),
            {},
            null,
            path.join(workspace, root.title, "electronio", appName)
          );
        } else {
          console.warn("No app name given");
        }
      })
      .then(() => {
        console.log("Write electron theme");
        return generateElectronIOTheme(
          path.join(
            workspace,
            root.title,
            "electronio",
            root[GraphKeys.PROJECTNAME]
          ),
          state
        );
      });
  };
}
function generateFolderStructure(dir, lib, relative, target_dir) {
  let directories = fs.readdirSync(dir);
  relative = relative || dir;
  directories.map(item => {
    let dirPath = path.join(dir, item);
    if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
      let reldir = dir.substr(relative.length);
      ensureDirectory(path.join(target_dir, reldir, item));
      generateFolderStructure(dirPath, lib, relative, target_dir);
    } else if (fs.existsSync(dirPath)) {
      let file = fs.readFileSync(dirPath, "utf8");
      let reldir = dir.substr(relative.length);
      file = bindTemplate(file, lib);
      fs.writeFileSync(path.join(target_dir, reldir, item), file, "utf8");
    }
  });
}
function generateReactNative(workspace, state) {
  let code_types = [...Object.values(ReactNativeTypes)];

  code_types.map(code_type => {
    let temp = Generator.generate({
      type: code_type,
      state
    });

    for (var fileName in temp) {
      ensureDirectory(path.join(workspace, temp[fileName].relative));
      writeFileSync(
        path.join(
          workspace,
          temp[fileName].relative,
          `${temp[fileName].relativeFilePath}`
        ),
        temp[fileName].template
      );
    }
  });
}
function generateElectronIO(workspace, state) {
  let code_types = [...Object.values(ReactNativeTypes)];

  code_types.map(code_type => {
    let temp = Generator.generate({
      type: code_type,
      language: UITypes.ElectronIO,
      state
    });

    for (var fileName in temp) {
      var relative = temp[fileName].relative;
      relative = relative.replace("src", "app");
      ensureDirectory(path.join(workspace, relative));
      console.log(
        path.join(workspace, relative, `${temp[fileName].relativeFilePath}`)
      );
      writeFileSync(
        path.join(workspace, relative, `${temp[fileName].relativeFilePath}`),
        temp[fileName].template
      );
    }
  });
}
function generateElectronIOTheme(workspace, state) {
  let result = ThemeServiceGenerator.Generate({
    state,
    language: UITypes.ElectronIO
  });

  if (result.location) {
    generateFolderStructure(
      path.join(`${result.location}`),
      {},
      null,
      path.join(workspace, result.relative)
    );
  }
  if (result.theme) {
    generateFolderStructure(
      path.join(`${result.theme}`),
      {},
      null,
      path.join(workspace, result.themerelative || result.relative)
    );
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
  let root = GetRootGraph(state);
  code_types.map(code_type => {
    var temp = Generator.generate({
      type: code_type,
      state
    });
    let area = CodeTypeToArea[code_type];
    for (var fileName in temp) {
      ensureDirectory(path.join(workspace, solutionName + area));
      if (temp[fileName].template) {
        writeFileSync(
          path.join(
            workspace,
            solutionName + area,
            `${temp[fileName].name}.cs`
          ),
          temp[fileName].template
        );
      }
      if (temp[fileName].interface) {
        ensureDirectory(path.join(workspace, solutionName + ".Interfaces"));
        writeFileSync(
          path.join(
            workspace,
            solutionName + ".Interfaces",
            `${temp[fileName].iname || fileName}.cs`
          ),
          temp[fileName].interface
        );
      }
      if (temp[fileName].test) {
        ensureDirectory(path.join(workspace, solutionName + ".Tests"));
        writeFileSync(
          path.join(
            workspace,
            solutionName + ".Tests",
            `${temp[fileName].tname || fileName}.cs`
          ),
          temp[fileName].test
        );
      }
    }
  });
  if (root) {
    ensureDirectory(path.join(workspace, solutionName + ".Tests"));
    writeFileSync(
      path.join(workspace, solutionName + ".Tests", `appsettings.json`),
      JSON.stringify(root.appConfig, null, 4)
    );
    ensureDirectory(path.join(workspace, solutionName + ".Web"));
    writeFileSync(
      path.join(workspace, solutionName + ".Web", `appsettings.json`),
      JSON.stringify(root.appConfig, null, 4)
    );
  }
}
function CreateRegistrations(nodes, namefunc = null, interfacefunc = null) {
  namefunc =
    namefunc ||
    function(v) {
      return GetCodeName(v);
    };
  interfacefunc =
    interfacefunc ||
    function(v) {
      return `I${GetCodeName(v)}`;
    };
  return nodes
    .map(v => {
      return `builder.RegisterType<${namefunc(v)}>().As<${interfacefunc(
        v
      )}>();`;
    })
    .join(NEW_LINE);
}
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log("doesnt exist : " + dir);
  } else {
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
  });
}

const CodeTypeToArea = {
  [NodeTypes.Controller]: path.join(".Web", "Controllers"),
  [NodeTypes.Model]: ".Models",
  [NodeTypes.ExtensionType]: ".Models",
  [NodeTypes.Maestro]: ".Controllers",
  [GeneratedTypes.ChangeParameter]: ".Models",
  [GeneratedTypes.ChangeResponse]: ".Models",
  [GeneratedTypes.ValidationRule]: ".Models",
  [GeneratedTypes.Executors]: ".Controllers",
  [GeneratedTypes.ModelGet]: ".Controllers",
  [GeneratedTypes.ModelReturn]: ".Controllers",
  [GeneratedTypes.ModelExceptions]: ".Controllers",
  [GeneratedTypes.Constants]: ".Models",
  [GeneratedTypes.Permissions]: ".Controllers",
  [GeneratedTypes.Validators]: ".Controllers",
  [GeneratedTypes.ModelItemFilter]: ".Controllers",
  [GeneratedTypes.StreamProcess]: ".Controllers",
  [GeneratedTypes.StreamProcessOrchestration]: ".Controllers"
};
