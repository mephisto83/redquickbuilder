/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/catch-or-return */
/* eslint-disable array-callback-return */
/* eslint-disable promise/always-return */
/* eslint-disable promise/param-names */
/* eslint-disable compat/compat */
import fs, { readFileSync } from 'fs';
import path from 'path';
import { writeFileSync } from 'fs';
import { platform } from 'os';
import {
	GeneratedTypes,
	NodeTypes,
	ReactNativeTypes,
	UITypes,
	LinkType,
	NEW_LINE,
	NodeAttributePropertyTypes
} from '../constants/nodetypes';
import Generator from '../generators/generator';
import { bindTemplate, FunctionTemplateKeys } from '../constants/functiontypes';
import { uuidv4 } from '../utils/array';
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
	GetMethodProps,
	GetMaestroNode,
	GetControllerNode
} from './uiactions';
import { GraphKeys, GetNodesLinkedTo } from '../methods/graph_methods';
import { HandlerEvents } from '../ipc/handler-events';
import {
	saveCurrentGraph,
	openGraph,
	toggleContextMenu,
	setRightMenuTab,
	newGraph,
	toggleVisualKey
} from './remoteActions';
import ThemeServiceGenerator from '../generators/themeservicegenerator';

const { ipcRenderer } = require('electron');
const REACTWEB = 'reactweb';
const hub: any = {};
ipcRenderer.on('message-reply', (event, arg) => {
	console.log(arg); // prints "pong"
	const reply = JSON.parse(arg);
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
		case 'e':
			setInComponentMode();
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
		case 'g':
			toggleVisualKey('GROUPS_ENABLED');
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
		default:
			break;
	}
});

function message(msg: any, body: any) {
	return {
		msg,
		body,
		id: uuidv4()
	};
}
function send(mess: string, body: { solutionName: any; appName: any; workspace: string }) {
	const m = message(mess, body);
	hub[m.id] = {};
	const result = Promise.resolve().then(
		() =>
			new Promise((resolve, fail) => {
				hub[m.id].resolve = resolve;
				hub[m.id].fail = fail;
			})
	);
	ipcRenderer.send('message', JSON.stringify(m));
	return result;
}
export function publishFiles() {
	scaffoldProject({ filesOnly: true })(GetDispatchFunc(), GetStateFunc());
}

export function scaffoldProject(options: any = {}) {
	const { filesOnly } = options;
	return (dispatch: any, getState: () => any) => {
		const state = getState();
		const root = GetRootGraph(state);
		const solutionName = root.title.split(' ').join('.');
		const workspace = root.workspaces ? root.workspaces[platform()] || root.workspace : root.workspace;
		ensureDirectory(path.join(workspace));
		ensureDirectory(path.join(workspace, root.title));
		(filesOnly
			? Promise.resolve()
			: send(HandlerEvents.scaffold.message, {
					solutionName,
					appName: root[GraphKeys.PROJECTNAME] || '',
					workspace: path.join(workspace, root.title, 'netcore')
				}))
			.then(
				() =>
					filesOnly
						? Promise.resolve()
						: send(HandlerEvents.reactnative.message, {
								solutionName,
								appName: root[GraphKeys.PROJECTNAME] || '',
								workspace: path.join(workspace, root.title, 'reactnative')
							})
			)
			.then(
				() =>
					filesOnly
						? Promise.resolve()
						: send(HandlerEvents.reactweb.message, {
								solutionName,
								appName: root[GraphKeys.PROJECTNAME] || '',
								workspace: path.join(workspace, root.title, 'reactweb')
							})
			)
			.then(
				() =>
					filesOnly
						? Promise.resolve()
						: send(HandlerEvents.electron.message, {
								solutionName,
								appName: root[GraphKeys.PROJECTNAME] || '',
								workspace: path.join(workspace, root.title, 'electronio')
							})
			)
			.then(() => {
				console.log('Finished Scaffolding.');
				generateFiles(path.join(workspace, root.title, 'netcore'), solutionName, state);
			})
			.then(() => {
				console.log('generate react-native files');
				generateReactNative(
					path.join(workspace, root.title, 'reactnative', root[GraphKeys.PROJECTNAME]),
					state
				);
			})
			.then(() => {
				console.log('generate electron io files');
				generateElectronIO(path.join(workspace, root.title, 'electronio', root[GraphKeys.PROJECTNAME]), state);
			})
			.then(() => {
				console.log('generate react web files');
				generateReactWeb(path.join(workspace, root.title, REACTWEB, root[GraphKeys.PROJECTNAME]), state);
			})
			.then(() => {
				const namespace = root ? root[GraphKeys.NAMESPACE] : null;
				const server_side_setup = root ? root[GraphKeys.SERVER_SIDE_SETUP] : null;
				const graph = root;
				const userNode = NodesByType(state, NodeTypes.Model).find((x: any) =>
					GetNodeProp(x, NodeProperties.IsUser)
				);
				const logicalParents = GetNodesLinkedTo(graph, {
					id: userNode.id,
					link: LinkType.UserLink
				}).filter((x: { id: any }) => x.id !== userNode.id);
				const logicalChildren = GetLogicalChildren(userNode.id);
				if (server_side_setup) {
					const children = [
						...logicalChildren,
						...logicalParents,
						...GetModelPropertyChildren(userNode.id).filter(
							(x: any) =>
								GetNodeProp(x, NodeProperties.UIAttributeType) === NodeAttributePropertyTypes.STRING
						)
					]
						.unique((x: { id: any }) => x.id)
						.filter((x: any) => GetCodeName(x) !== 'Id')
						.filter((x: any) => GetCodeName(x) !== 'UserName')
						.map(
							(child: { id: any }) => `
            if (!string.IsNullOrEmpty(user.${GetCodeName(child.id)}))
                result.Add(new Claim("${GetCodeName(child.id)}", user.${GetCodeName(child.id)}));
            `
						)
						.join('');
					generateFolderStructure(
						path.join(`./app/templates/net_core_mvc/identity/${server_side_setup}`),
						{
							maestro_registrations: CreateRegistrations(
								NodesByType(null, NodeTypes.Maestro).filter(
									(x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration)
								)
							),
							permission_registrations: CreateRegistrations(
								NodesByType(null, NodeTypes.Model).filter((x: any) =>
									GetNodeProp(x, NodeProperties.IsAgent)
								),
								(v: any) => `Permissions${GetCodeName(v)}`,
								(v: any) => `IPermissions${GetCodeName(v)}`
							),
							executor_registrations: CreateRegistrations(
								NodesByType(null, NodeTypes.Model).filter((x: any) =>
									GetNodeProp(x, NodeProperties.IsAgent)
								),
								(v: any) => `${GetCodeName(v)}Executor`,
								(v: any) => `I${GetCodeName(v)}Executor`
							),
							orchestration_registrations: CreateRegistrations(
								NodesByType(null, NodeTypes.Model).filter((x: any) =>
									GetNodeProp(x, NodeProperties.IsAgent)
								),
								(v: any) => `${GetCodeName(v)}StreamProcessOrchestration`,
								(v: any) => `I${GetCodeName(v)}StreamProcessOrchestration`
							),
							validation_registrations: CreateRegistrations(
								NodesByType(null, NodeTypes.Model).filter((x: any) =>
									GetNodeProp(x, NodeProperties.IsAgent)
								),
								(v: any) => `${GetCodeName(v)}Validations`,
								(v: any) => `I${GetCodeName(v)}Validations`
							),
							model: GetNodeProp(userNode, NodeProperties.CodeName),
							namespace
						},
						null,
						path.join(path.join(workspace, root.title, 'netcore'), solutionName + path.join('.Web'))
					);
					let more_interfaces = '';
					const interface_implementations = [];
					const user_update_implementation: string[] = [];
					const post_registrations: string[] = [];
					let claim_service_interfaces = '';
					let user_node = null;
					const template_name = 'ICreateAgents';
					const interfaceFunctions = NodesByType(state, NodeTypes.ClaimService)
						.map((claimService: { id: any }) => {
							const authMethods = GetNodesLinkedTo(graph, {
								id: claimService.id,
								link: LinkType.ClaimServiceAuthorizationMethod
							});
							const userUpdateMethods = GetNodesLinkedTo(graph, {
								id: claimService.id,
								link: LinkType.ClaimServiceUpdateUserMethod
							});
							userUpdateMethods.map((method: any) => {
								const parameters = GetMethodProps(method);
								if (parameters && parameters[FunctionTemplateKeys.Model]) {
									const user = GetCodeName(parameters[FunctionTemplateKeys.User]);
									const maestro = GetMaestroNode(method.id);
									if (maestro) {
										const controller = GetControllerNode(maestro.id);
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
								.map((method: any) => {
									const parameters = GetMethodProps(method);
									if (parameters && parameters[FunctionTemplateKeys.Model]) {
										const model = GetCodeName(parameters[FunctionTemplateKeys.Model]);
										const user = GetCodeName(parameters[FunctionTemplateKeys.User]);
										const maestro = GetMaestroNode(method.id);
										if (maestro) {
											const controller = GetControllerNode(maestro.id);
											if (controller) {
												user_node = user;
												interface_implementations.push(`
                    public async Task<${model}> Create(${user} user, ${model} model)
                    {
                      var maestro = RedStrapper.Resolve<I${GetCodeName(maestro)}>();
                      return await maestro.${GetCodeName(method)}(user, model);
                    }`);
												post_registrations.push(`
                    var  ${model.toLowerCase()} =  ${model}.Create();
                    ${model.toLowerCase()}.Owner = user.Id;
                    ${model.toLowerCase()} = await Create(user, ${model.toLowerCase()});
                    user.${model}  = ${model.toLowerCase()}.Id;`);
												return `Task<${model}> Create(${user} ${FunctionTemplateKeys.User}, ${model} ${FunctionTemplateKeys.Model});`;
											}
										}
									}
									return null;
								})
								.filter((x: any) => x);
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
					const props = [
						...logicalParents,
						...GetModelPropertyChildren(userNode.id).filter(
							(x: any) =>
								GetNodeProp(x, NodeProperties.UIAttributeType) === NodeAttributePropertyTypes.STRING
						)
					]
						.map((prop) => GetCodeName(prop))
						.unique()
						.map(
							(v: any) => `if (claim.Type == "${v}")
              {
                result.${v} = claim.Value;
              }`
						)
						.join(NEW_LINE);

					generateFolderStructure(
						path.join(`./app/templates/net_core_mvc/identity/RedQuickControllers`),
						{
							model: GetNodeProp(userNode, NodeProperties.CodeName),
							namespace,
							children,
							more_interfaces,
							interface_implementations: interface_implementations.join(NEW_LINE),
							claim_service_interfaces,
							create_properties: props
						},
						null,
						path.join(path.join(workspace, root.title, 'netcore'), solutionName + path.join('.Controllers'))
					);

					generateFolderStructure(
						path.join(`./app/templates/net_core_mvc/identity/RedQuickTests`),
						{
							namespace
						},
						null,
						path.join(path.join(workspace, root.title, 'netcore'), solutionName + path.join('.Tests'))
					);
				}
			})
			.then(() => {
				console.log('Write react-native files');
				const appName = root[GraphKeys.PROJECTNAME];
				const version = 'v1';
				if (appName) {
					return generateFolderStructure(
						path.join(`./app/templates/react_native/${version}`),
						{},
						null,
						path.join(workspace, root.title, 'reactnative', appName)
					);
				}
				console.warn('No app name given');
			})
			.then(() => {
				console.log('Clear electron theme');
				return clearElectronIOTheme(
					path.join(workspace, root.title, 'electronio', root[GraphKeys.PROJECTNAME]),
					state
				);
			})
			.then(() => {
				console.log('Create react web theme');
				return clearReactWebTheme(path.join(workspace, root.title, REACTWEB, root[GraphKeys.PROJECTNAME]));
			})
			.then(() => {
				console.log('Write electron files');
				const appName = root[GraphKeys.PROJECTNAME];
				const version = 'v1';
				if (appName) {
					return generateFolderStructure(
						path.join(`./app/templates/electronio/${version}`),
						{},
						null,
						path.join(workspace, root.title, 'electronio', appName)
					);
				}
				console.warn('No app name given');
			})
			.then(() => {
				console.log('Write reactweb files');
				const appName = root[GraphKeys.PROJECTNAME];
				const version = 'v1';
				if (appName) {
					return generateFolderStructure(
						path.join(`./app/templates/reactweb/${version}`),
						{},
						null,
						path.join(workspace, root.title, 'reactweb', appName)
					);
				}
				console.warn('No app name given');
			})
			.then(() => {
				console.log('Write electron theme');
				return generateElectronIOTheme(
					path.join(workspace, root.title, 'electronio', root[GraphKeys.PROJECTNAME]),
					state
				);
			})
			.then(() => {
				return generateReactWebTheme(
					path.join(workspace, root.title, 'reactweb', root[GraphKeys.PROJECTNAME]),
					state
				);
			});
	};
}
function generateFolderStructure(
	dir: any,
	lib: {
		maestro_registrations?: any;
		permission_registrations?: any;
		executor_registrations?: any;
		orchestration_registrations?: any;
		validation_registrations?: any;
		model?: any;
		namespace?: any;
		children?: any;
		more_interfaces?: string;
		interface_implementations?: string;
		claim_service_interfaces?: string;
		create_properties?: any;
	},
	relative: any,
	target_dir: string
) {
	const directories = fs.readdirSync(dir);
	relative = relative || dir;
	directories.map((item) => {
		const dirPath = path.join(dir, item);
		if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
			const reldir = dir.substr(relative.length);
			ensureDirectory(path.join(target_dir, reldir, item));
			generateFolderStructure(dirPath, lib, relative, target_dir);
		} else if (fs.existsSync(dirPath)) {
			let file = fs.readFileSync(dirPath, 'utf8');
			const reldir = dir.substr(relative.length);
			file = bindTemplate(file, lib);
			fs.writeFileSync(path.join(target_dir, reldir, item), file, 'utf8');
		}
	});
}
function generateReactNative(workspace: string, state: any) {
	const code_types = [ ...Object.values(ReactNativeTypes) ];

	code_types.map((code_type) => {
		const temp = Generator.generate({
			type: code_type,
			language: UITypes.ReactNative,
			state
		});

		for (const fileName in temp) {
			ensureDirectory(path.join(workspace, temp[fileName].relative));
			writeFileSync(
				path.join(workspace, temp[fileName].relative, `${temp[fileName].relativeFilePath}`),
				temp[fileName].template
			);
		}
	});
}
function generateElectronIO(workspace: string, state: any) {
	const codeTypes = [ ...Object.values(ReactNativeTypes) ];

	codeTypes.map((codeType) => {
		const temp = Generator.generate({
			type: codeType,
			language: UITypes.ElectronIO,
			state
		});

		Object.keys(temp).map((fileName) => {
			let { relative } = temp[fileName];
			relative = relative.replace('src', 'app');
			ensureDirectory(path.join(workspace, relative));
			console.log(path.join(workspace, relative, `${temp[fileName].relativeFilePath}`));
			writeFileSync(
				path.join(workspace, relative, `${temp[fileName].relativeFilePath}`),
				temp[fileName].template
			);
		});
	});
}

function generateReactWeb(workspace: string, state: any) {
	const codeTypes = [ ...Object.values(ReactNativeTypes) ];

	codeTypes.map((codeType) => {
		const temp = Generator.generate({
			type: codeType,
			language: UITypes.ReactWeb,
			state
		});

		Object.keys(temp).map((fileName) => {
			let { relative } = temp[fileName];
			relative = relative.replace('app', 'src');
			let dirname = path.dirname(path.join(workspace, relative, `${temp[fileName].relativeFilePath}`));
			ensureDirectory(dirname);
			console.log(path.join(workspace, relative, `${temp[fileName].relativeFilePath}`));
			writeFileSync(
				path.join(workspace, relative, `${temp[fileName].relativeFilePath}`),
				temp[fileName].template
			);
		});
	});
}

function clearElectronIOTheme(workspace: string, state: any) {
	const results = ThemeServiceGenerator.Generate({
		state,
		language: UITypes.ElectronIO
	});
	const toClear: string[] = [];
	results.filter((x: any) => !x.userDefined).forEach((result: any) => {
		if (result.theme) {
			toClear.push(path.join(workspace, result.themerelative || result.relative));
		}
	});
	toClear.forEach((dir) => {
		deleteAll(dir);
	});
}
function clearReactWebTheme(workspace: string, state?: any) {
	const results = ThemeServiceGenerator.Generate({
		state,
		language: UITypes.ReactWeb
	});
	const toClear: string[] = [];
	results.filter((x: any) => !x.userDefined).forEach((result: any) => {
		if (result.theme) {
			toClear.push(path.join(workspace, result.themerelative || result.relative));
		}
	});
	toClear.forEach((dir) => {
		deleteAll(dir);
	});
}
function handleLinkStyles(result: { styleLink?: any }, workspace: string, srcpath = `./app/app.html`) {
	let appHtml = readFileSync(path.join(workspace, srcpath), 'utf8');
	const linkInsert = '<!-- link-insert -->';
	const linkInsertEnd = '<!-- link-insert-end -->';
	let inserHtml = `${linkInsert}${result.styleLink}${linkInsertEnd}</head>`;
	if (appHtml.indexOf(linkInsert) === -1) {
		appHtml = appHtml.replace('</head>', inserHtml);
	} else {
		inserHtml = `${linkInsert}${result.styleLink}${linkInsertEnd}`;
		const start = appHtml.indexOf(linkInsert);
		const end = appHtml.indexOf(linkInsertEnd) + linkInsertEnd.length;
		if (start !== -1 && end !== linkInsertEnd.length - 1) {
			appHtml = appHtml.slice(0, start) + inserHtml + appHtml.slice(end);
		}
	}
	writeFileSync(path.join(workspace, srcpath), appHtml, 'utf8');
}

function generateElectronIOTheme(workspace: string, state: any) {
	const results = ThemeServiceGenerator.Generate({
		state,
		language: UITypes.ElectronIO
	});
	results.forEach((result: any) => {
		if (result.userDefined) {
			writeFileSync(path.join(workspace, result.relative), result.theme);
			handleLinkStyles(result, workspace);
		} else {
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
	});
}
function generateReactWebTheme(workspace: string, state: any) {
	const results = ThemeServiceGenerator.Generate({
		state,
		language: UITypes.ReactWeb
	});
	results.forEach((result: any) => {
		if (result.userDefined) {
			writeFileSync(path.join(workspace, result.relative), result.theme);
			handleLinkStyles(result, workspace, './public/index.html');
		} else {
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
	});
}
function generateFiles(workspace: string, solutionName: string, state: any) {
	const code_types = [
		NodeTypes.Controller,
		NodeTypes.Model,
		NodeTypes.ExtensionType,
		NodeTypes.Maestro,
		NodeTypes.FetchService,
		...Object.values(GeneratedTypes)
	];
	const root = GetRootGraph(state);
	code_types.map((code_type) => {
		const temp = Generator.generate({
			type: code_type,
			state
		});
		const area = CodeTypeToArea[code_type];
		for (const fileName in temp) {
			ensureDirectory(path.join(workspace, solutionName + area));
			if (temp[fileName].template) {
				writeFileSync(
					path.join(workspace, solutionName + area, `${temp[fileName].name}.cs`),
					temp[fileName].template
				);
			}
			if (temp[fileName].interface) {
				ensureDirectory(path.join(workspace, `${solutionName}.Interfaces`));
				writeFileSync(
					path.join(workspace, `${solutionName}.Interfaces`, `${temp[fileName].iname || fileName}.cs`),
					temp[fileName].interface
				);
			}
			if (temp[fileName].test) {
				ensureDirectory(path.join(workspace, `${solutionName}.Tests`));
				writeFileSync(
					path.join(workspace, `${solutionName}.Tests`, `${temp[fileName].tname || fileName}.cs`),
					temp[fileName].test
				);
			}
		}
	});
	if (root) {
		ensureDirectory(path.join(workspace, `${solutionName}.Tests`));
		writeFileSync(
			path.join(workspace, `${solutionName}.Tests`, `appsettings.json`),
			JSON.stringify(root.appConfig, null, 4)
		);
		ensureDirectory(path.join(workspace, `${solutionName}.Web`));
		writeFileSync(
			path.join(workspace, `${solutionName}.Web`, `appsettings.json`),
			JSON.stringify(root.appConfig, null, 4)
		);
	}
}
function CreateRegistrations(nodes: any[], namefunc: any = null, interfacefunc: any = null) {
	namefunc =
		namefunc ||
		function(v: any) {
			return GetCodeName(v);
		};
	interfacefunc =
		interfacefunc ||
		function(v: any) {
			return `I${GetCodeName(v)}`;
		};
	return nodes.map((v: any) => `builder.RegisterType<${namefunc(v)}>().As<${interfacefunc(v)}>();`).join(NEW_LINE);
}
function ensureDirectory(dir: any) {
	if (!fs.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path.sep);
	_dir_parts.map((_: any, i: number) => {
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
	[NodeTypes.Controller]: path.join('.Web', 'Controllers'),
	[NodeTypes.Model]: '.Models',
	[NodeTypes.ExtensionType]: '.Models',
	[NodeTypes.FetchService]: path.join('.Web', 'Controllers'),
	[NodeTypes.Maestro]: '.Controllers',
	[GeneratedTypes.ChangeParameter]: '.Models',
	[GeneratedTypes.ChangeResponse]: '.Models',
	// [GeneratedTypes.ValidationRule]: '.Models',
	[GeneratedTypes.Executors]: '.Controllers',
	[GeneratedTypes.ModelGet]: '.Controllers',
	[GeneratedTypes.ModelReturn]: '.Controllers',
	[GeneratedTypes.ModelExceptions]: '.Controllers',
	[GeneratedTypes.Constants]: '.Models',
	[GeneratedTypes.Permissions]: '.Controllers',
	[GeneratedTypes.Validators]: '.Controllers',
	[GeneratedTypes.CSDataChain]: '.Controllers',
	[GeneratedTypes.ModelItemFilter]: '.Controllers',
	[GeneratedTypes.StreamProcess]: '.Controllers',
	[GeneratedTypes.StreamProcessOrchestration]: '.Controllers'
};

function deleteAll(directory: any) {
	if (fs.existsSync(directory) && fs.lstatSync(directory).isDirectory()) {
		const files = fs.readdirSync(directory);
		files.forEach((file) => {
			const dirPath = path.join(directory, file);
			if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
				deleteAll(dirPath);
			} else {
				fs.unlinkSync(path.join(directory, file));
			}
		});
		fs.rmdirSync(directory);
	}
}
