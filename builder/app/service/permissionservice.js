import {
    GetMethodNode, GetMethodDefinition, GetMethodNodeProp, GetCodeName,
    GetCombinedCondition, GetPermissionsSortedByAgent, GetNameSpace,
    GetArbiterPropertyDefinitions,
    GetNodeCode,
    GetArbiterPropertyImplementations,
    GetAgentNodes
} from "../actions/uiactions";
import { bindTemplate } from "../constants/functiontypes";
import fs from 'fs';
import { ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, NEW_LINE } from "../constants/nodetypes";
import NamespaceGenerator from "../generators/namespacegenerator";
function GetMethodDefinitionPermissionSection(id) {
    let methodDefinition = GetMethodDefinition(id);
    if (methodDefinition && methodDefinition.permission) {
        return methodDefinition.permission;
    }
    console.warn('doesnt define a permission for method type ');
    return false;
}

export function GetPermissionMethodImplementation(id, language = ProgrammingLanguages.CSHARP) {
    let permissionSection = GetMethodDefinitionPermissionSection(id);
    let { implementation } = permissionSection;
    let implementation_template = fs.readFileSync(implementation, 'utf8');
    let parameters = GetPermissionMethodParametersImplementation(id, language);
    let conditions = GetCombinedCondition(id, language);

    return bindTemplate(implementation_template, {
        parameters,
        conditions,
        function_name: GetCodeName(id)
    })
}

export function GetPermissionMethodInterface(id, language = ProgrammingLanguages.CSHARP) {
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
    })
}

export function GetAgentPermissionInterface(agentId) {
    let dictionary = GetPermissionsSortedByAgent();
    if (dictionary && dictionary[agentId]) {
        let namespace = GetNameSpace();
        let interface_ = BuildAgentPermissionInterface(agentId, dictionary[agentId].map(t => t.id));
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
    }
    else {
        throw 'agent doesnt have any permissions';
    }
}

export function GenerateAgentPermissionInterfacesAndImplementations() {
    var agents = GetAgentNodes();
    let result = {};
    agents.map(agent => {
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
export function GetAgentPermissionImplementation(agentId) {
    let dictionary = GetPermissionsSortedByAgent();
    if (dictionary && dictionary[agentId]) {
        let namespace = GetNameSpace();
        let implementation = BuildAgentPermissionImplementation(agentId, dictionary[agentId].map(t => t.id));
        return NamespaceGenerator.Generate({
            template: implementation,
            usings: [
                ...STANDARD_CONTROLLER_USING,
                `${namespace}${NameSpace.Extensions}`,
                `${namespace}${NameSpace.Model}`,
                `${namespace}${NameSpace.Interface}`,
                `${namespace}${NameSpace.Controllers}`,
                `${namespace}${NameSpace.Constants}`].filter(x => x),
            namespace,
            space: NameSpace.Permissions
        });
    }
    else {
        throw 'agent doesnt have any permissions';
    }
}

export function BuildAgentPermissionInterface(agentId, permissions, language = ProgrammingLanguages.CSHARP) {
    let methods = permissions.map(permission => {
        return GetPermissionMethodInterface(permission, language);
    }).filter(x => x).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/permissions/permissions_interface.tpl', 'utf8');

    return bindTemplate(template, {
        agent_type: GetCodeName(agentId),
        methods
    });
}

export function BuildAgentPermissionImplementation(agentId, permissions, language = ProgrammingLanguages.CSHARP) {
    let methods = permissions.map(permission => {
        return GetPermissionMethodImplementation(permission, language);
    }).filter(x => x).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/permissions/permissions_impl.tpl', 'utf8');
    let _constructTemplate = fs.readFileSync('./app/templates/permissions/constructor.tpl', 'utf8');
    let constructor = bindTemplate(_constructTemplate, {
        agent_type: `${GetCodeName(agentId)}`,
        arbiters: GetArbiterPropertyImplementations(4, language)
    });
    return bindTemplate(template, {
        agent_type: GetCodeName(agentId),
        arbiters: GetArbiterPropertyDefinitions(),
        constructor,
        methods
    });
}

export function GetPermissionMethodParameters(id) {
    let permissionSection = GetMethodDefinitionPermissionSection(id);
    let { params } = permissionSection;
    let methodNode = GetMethodNode(id);
    return params.map(param => {
        return {
            paramClass: GetMethodNodeProp(methodNode, param),
            paramProperty: param
        };
    })
}

export function GetPermissionMethodParametersImplementation(id, language) {
    let parameters = GetPermissionMethodParameters(id);
    switch (language) {
        case ProgrammingLanguages.CSHARP:
            return parameters.map(t => `${GetCodeName(t.paramClass)} ${t.paramProperty}`).join(', ');

    }
}