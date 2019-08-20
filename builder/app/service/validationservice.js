import {
    GetMethodNode, GetMethodDefinition, GetMethodNodeProp, GetCodeName,
    GetCombinedCondition, GetValidationsSortedByAgent, GetNameSpace,
    GetArbiterPropertyDefinitions,
    GetNodeCode,
    GetArbiterPropertyImplementations,
    GetAgentNodes
} from "../actions/uiactions";
import { bindTemplate } from "../constants/functiontypes";
import fs from 'fs';
import { ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, NEW_LINE } from "../constants/nodetypes";
import NamespaceGenerator from "../generators/namespacegenerator";
function GetMethodDefinitionValidationSection(id) {
    let methodDefinition = GetMethodDefinition(id);
    if (methodDefinition && methodDefinition.validation) {
        return methodDefinition.validation;
    }
    console.warn('doesnt define a validation for method type ');
    return false;
}

export function GetValidationMethodImplementation(id, language = ProgrammingLanguages.CSHARP) {
    let validationSection = GetMethodDefinitionValidationSection(id);
    if (!validationSection) { return false }
    let { implementation } = validationSection;
    console.log(validationSection)
    let implementation_template = fs.readFileSync(implementation, 'utf8');
    let parameters = GetValidationMethodParametersImplementation(id, language);
    let conditions = GetCombinedCondition(id, language);

    return bindTemplate(implementation_template, {
        parameters,
        conditions,
        function_name: GetCodeName(id)
    })
}

export function GetValidationMethodInterface(id, language = ProgrammingLanguages.CSHARP) {
    let validationSection = GetMethodDefinitionValidationSection(id);
    if (!validationSection) {
        return false;
    }
    let { interface_ } = validationSection;

    let interface_template = fs.readFileSync(interface_, 'utf8');
    let parameters = GetValidationMethodParametersImplementation(id, language);

    return bindTemplate(interface_template, {
        parameters,
        function_name: GetCodeName(id)
    })
}

export function GetAgentValidationInterface(agentId) {
    let dictionary = GetValidationsSortedByAgent();
    if (dictionary && dictionary[agentId]) {
        let namespace = GetNameSpace();
        let interface_ = BuildAgentValidationInterface(agentId, dictionary[agentId].map(t => t.id));
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
        throw 'agent doesnt have any validations';
    }
}
export function GenerateAgentValidationInterfacesAndImplementations() {
    var agents = GetAgentNodes();
    let result = {};
    agents.map(agent => {
        console.warn(`agent : ${agent.id}`)
        let agentName = GetCodeName(agent.id);
        let temp = {
            name: `${agentName}Validations`,
            iname: `I${agentName}Validations`,
            template: GetAgentValidationImplementation(agent.id),
            interface: GetAgentValidationInterface(agent.id)
        };
        result[agentName] = temp;
    });

    return result;
}

export function GetAgentValidationImplementation(agentId) {
    let dictionary = GetValidationsSortedByAgent();
    if (dictionary && dictionary[agentId]) {
        let namespace = GetNameSpace();
        let implementation = BuildAgentValidationImplementation(agentId, dictionary[agentId].map(t => t.id));
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
            space: NameSpace.Validations
        });
    }
    else {
        throw 'agent doesnt have any validations';
    }
}

export function BuildAgentValidationInterface(agentId, validations, language = ProgrammingLanguages.CSHARP) {
    let methods = validations.map(Validation => {
        return GetValidationMethodInterface(Validation, language);
    }).filter(x => x).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/validation/validation_interface.tpl', 'utf8');

    return bindTemplate(template, {
        agent_type: GetCodeName(agentId),
        methods
    });
}

export function BuildAgentValidationImplementation(agentId, validations, language = ProgrammingLanguages.CSHARP) {
    let methods = validations.map(Validation => {
        return GetValidationMethodImplementation(Validation, language);
    }).filter(x => x).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/validation/validations_impl.tpl', 'utf8');
    let _constructTemplate = fs.readFileSync('./app/templates/validation/constructor.tpl', 'utf8');
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

export function GetValidationMethodParameters(id) {
    let validationSection = GetMethodDefinitionValidationSection(id);
    let { params } = validationSection;
    let methodNode = GetMethodNode(id);
    return params.map(param => {
        return {
            paramClass: GetMethodNodeProp(methodNode, param),
            paramProperty: param
        };
    })
}

export function GetValidationMethodParametersImplementation(id, language) {
    let parameters = GetValidationMethodParameters(id);
    switch (language) {
        case ProgrammingLanguages.CSHARP:
            return parameters.map(t => `${GetCodeName(t.paramClass)} ${t.paramProperty}`).join(', ');

    }
}