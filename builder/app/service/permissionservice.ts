import {
	GetMethodNode,
	GetMethodDefinition,
	GetMethodNodeProp,
	GetCodeName,
	GetCombinedCondition,
	GetPermissionsSortedByAgent,
	GetNameSpace,
	GetArbiterPropertyDefinitions,
	GetNodeCode,
	GetArbiterPropertyImplementations,
	GetAgentNodes,
	safeFormatTemplateProperty,
	GetCustomServiceImplementations,
	NodeTypes,
	GetCustomServiceDefinitions
} from '../actions/uiactions';
import { bindTemplate } from '../constants/functiontypes';
import fs from 'fs';
import { ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, NEW_LINE } from '../constants/nodetypes';
import NamespaceGenerator from '../generators/namespacegenerator';
function GetMethodDefinitionPermissionSection(id: any) {
	let methodDefinition = GetMethodDefinition(id);
	if (methodDefinition && methodDefinition.permission) {
		return methodDefinition.permission;
	}
	console.warn('doesnt define a permission for method type ');
	return false;
}

export function GetPermissionMethodImplementation(id: any, language = ProgrammingLanguages.CSHARP) {
	let permissionSection = GetMethodDefinitionPermissionSection(id);
	let { implementation } = permissionSection;
	let implementation_template = fs.readFileSync(implementation, 'utf8');
	let parameters = GetPermissionMethodParametersImplementation(id, language);
	let conditions = GetCombinedCondition(id, language);

	return bindTemplate(implementation_template, {
		parameters,
		conditions,
		function_name: GetCodeName(id)
	});
}

export function GetPermissionMethodInterface(id: any, language = ProgrammingLanguages.CSHARP) {
	let permissionSection = GetMethodDefinitionPermissionSection(id);
	if (!permissionSection) {
		return false;
	}
	let { interface_ } = permissionSection;

	let interface_template = fs.readFileSync(interface_, 'utf8');
	let parameters = GetPermissionMethodParametersImplementation(id, language);

	return bindTemplate(interface_template, {
		parameters,
		function_name: GetCodeName(id)
	});
}

export function GetAgentPermissionInterface(agentId: any) {
	let dictionary = GetPermissionsSortedByAgent();
	//    if (dictionary && dictionary[agentId]) {
	let namespace = GetNameSpace();
	let interface_ = BuildAgentPermissionInterface(agentId, (dictionary[agentId] || []).map((t: any) => t.id));
	return NamespaceGenerator.Generate({
		template: interface_,
		usings: [
			...STANDARD_CONTROLLER_USING,
			`${namespace}${NameSpace.Interface}`,
			`${namespace}${NameSpace.Model}`
		],
		namespace,
		space: NameSpace.Interface
	});
	// }
	// else {
	//     throw 'agent doesnt have any permissions';
	// }
}

export function GenerateAgentPermissionInterfacesAndImplementations() {
	var agents = GetAgentNodes();
	let result: any = {};
	agents.map((agent) => {
		let agentName = GetCodeName(agent.id);
		let temp = {
			name: `Permissions${agentName}`,
			iname: `IPermissions${agentName}`,
			template: GetAgentPermissionImplementation(agent.id),
			interface: GetAgentPermissionInterface(agent.id)
		};
		result[agentName] = temp;
	});

	return result;
}
export function GetAgentPermissionImplementation(agentId: any) {
	let dictionary = GetPermissionsSortedByAgent();
	//if (dictionary && dictionary[agentId]) {
	let namespace = GetNameSpace();
	let implementation = BuildAgentPermissionImplementation(agentId, (dictionary[agentId] || []).map((t: any) => t.id));
	return NamespaceGenerator.Generate({
		template: implementation,
		usings: [
			...STANDARD_CONTROLLER_USING,
			`${namespace}${NameSpace.Extensions}`,
			`${namespace}${NameSpace.Model}`,
			`${namespace}${NameSpace.Interface}`,
			`${namespace}${NameSpace.Controllers}`,
			`${namespace}${NameSpace.Constants}`
		].filter((x) => x),
		namespace,
		space: NameSpace.Permissions
	});
	// }
	// else {
	//     throw 'agent doesnt have any permissions';
	// }
}

export function BuildAgentPermissionInterface(agentId: any, permissions: any, language: any = ProgrammingLanguages.CSHARP) {
	let methods = permissions
		.map((permission: any) => {
			return GetPermissionMethodInterface(permission, language);
		})
		.filter((x: any) => x)
		.join(NEW_LINE);
	let template = fs.readFileSync('./app/templates/permissions/permissions_interface.tpl', 'utf8');

	return bindTemplate(template, {
		agent_type: GetCodeName(agentId),
		methods
	});
}

export function BuildAgentPermissionImplementation(
	agentId: any,
	permissions: any,
	language: any = ProgrammingLanguages.CSHARP
) {
	let methods = permissions
		.map((permission: any) => {
			return GetPermissionMethodImplementation(permission, language);
		})
		.filter((x: any) => x)
		.join(NEW_LINE);
	let template = fs.readFileSync('./app/templates/permissions/permissions_impl.tpl', 'utf8');
	let _constructTemplate = fs.readFileSync('./app/templates/permissions/constructor.tpl', 'utf8');
	let customService = GetCustomServiceImplementations(NodeTypes.Permission) || '';
	let constructor = bindTemplate(_constructTemplate, {
		agent_type: `${GetCodeName(agentId)}`,
		arbiters: [ GetArbiterPropertyImplementations(4), customService ].join(NEW_LINE)
	});

	return bindTemplate(template, {
		agent_type: GetCodeName(agentId),
		arbiters: [ GetArbiterPropertyDefinitions(), GetCustomServiceDefinitions(NodeTypes.Permission) ].join(NEW_LINE),
		constructor,
		methods
	});
}

export function GetPermissionMethodParameters(id: any) {
	let permissionSection = GetMethodDefinitionPermissionSection(id);
	let { params } = permissionSection;
	let methodNode = GetMethodNode(id);
	return params.map((param: any) => {
		return {
			paramClass: GetMethodNodeProp(methodNode, param),
			paramProperty: safeFormatTemplateProperty(param)
		};
	});
}

export function GetPermissionMethodParametersImplementation(id: any, language = ProgrammingLanguages.CSHARP) {
	let parameters = GetPermissionMethodParameters(id);
	switch (language) {
		case ProgrammingLanguages.CSHARP:
			return parameters.map((t: any) => `${GetCodeName(t.paramClass)} ${t.paramProperty}`).join(', ');
	}
}
