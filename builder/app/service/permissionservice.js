import { GetMethodNode, GetMethodDefinition, GetMethodNodeProp, GetCodeName, GetCombinedCondition, GetPermissionsSortedByAgent } from "../actions/uiactions";
import { MethodTemplateKeys, bindTemplate } from "../constants/functiontypes";
import fs from 'fs';
import { ProgrammingLanguages } from "../constants/nodetypes";
function GetMethodDefinitionPermissionSection(id) {
    let methodDefinition = GetMethodDefinition(id);
    if (methodDefinition.permission) {
        return methodDefinition.permission;
    }
    throw 'doesnt define a permission for method type ' + methodDefinition.title;
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

    }
    else {
        throw 'agent doesnt have any permissions';
    }
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