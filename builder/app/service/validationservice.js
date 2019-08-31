import {
    GetMethodNode, GetMethodDefinition, GetMethodNodeProp, GetCodeName,
    GetCombinedCondition, GetValidationsSortedByAgent, GetNameSpace,
    GetArbiterPropertyDefinitions,
    GetNodeCode,
    GetArbiterPropertyImplementations,
    GetAgentNodes,
    GetMethodFunctionValidation,
    GetValidationNode,
    safeFormatTemplateProperty
} from "../actions/uiactions";
import { bindTemplate, FunctionTemplateKeys } from "../constants/functiontypes";
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
export function GetValidationEntries(agent, as_interface, language = ProgrammingLanguages.CSHARP) {
    let dictionary = GetValidationsSortedByAgent();
    if (dictionary && dictionary[agent]) {


        let validation_entry = as_interface ? './app/templates/validation/validation_entry_interface.tpl' : './app/templates/validation/validation_entry.tpl';
        let validation_entry_template = fs.readFileSync(validation_entry, 'utf8');
        console.log(validation_entry);

        let validatorNodes = dictionary[agent];
        console.log(validatorNodes);
        let methods = validatorNodes.map(valNode => {
            return GetMethodNode(valNode.id);
        }).unique().groupBy(x => {
            var validationNode = GetValidationNode(x.id);
            let validationSection = GetMethodDefinitionValidationSection(validationNode.id);
            if (validationSection.asModel) {
                return GetMethodNodeProp(x, validationSection.asModel)
            }
            return GetMethodNodeProp(x, FunctionTemplateKeys.Model)
        });

        console.log(Object.keys(methods).map(x => GetCodeName(x)));
        let validation_case_template = fs.readFileSync('./app/templates/validation/validation_case.tpl', 'utf8');
        return Object.keys(methods).map(modelId => {
            console.log(`modelId ${GetCodeName(modelId)}`)
            let parameters = `${GetCodeName(modelId)} model, ${GetCodeName(agent)} agent, ${GetCodeName(modelId)}ChangeBy${GetCodeName(agent)} change_parameter`;
            let conditions = '';
            console.log(methods[modelId]);
            conditions = methods[modelId].map(method => {
                let validationNode = GetValidationNode(method.id);
                if (validatorNodes.some(v => v.id === validationNode.id))
                    return bindTemplate(validation_case_template, {
                        function_name: `FunctionName.${GetCodeName(method.id)}`,
                        function: `${GetCodeName(validationNode)}`,
                        parameters: `model, agent, change_parameter`
                    })

            }).filter(x => x);
            return bindTemplate(validation_entry_template, {
                parameters,
                switch_parameter: 'change_parameter.FunctionName',
                conditions: conditions.join(NEW_LINE)
            })
        });
    }
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
                `${namespace}${NameSpace.Model}`,
                `${namespace}${NameSpace.Parameters}`
            ],
            namespace,
            space: NameSpace.Interface
        });
    }
    else {
        return false;
    }
}
export function GenerateAgentValidationInterfacesAndImplementations() {
    var agents = GetAgentNodes();
    let result = {};
    agents.map(agent => {
        console.warn(`agent : ${agent.id}`)
        let agentName = GetCodeName(agent.id);
        let template = GetAgentValidationImplementation(agent.id);
        let _interface = GetAgentValidationInterface(agent.id);
        if (!template || !_interface) {
            return;
        }
        let temp = {
            name: `${agentName}Validations`,
            iname: `I${agentName}Validations`,
            template,
            interface: _interface
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
                `${namespace}${NameSpace.Parameters}`,
                `${namespace}${NameSpace.Controllers}`,
                `${namespace}${NameSpace.Constants}`].filter(x => x),
            namespace,
            space: NameSpace.Validations
        });
    }
    else {
        return false;
    }
}

export function BuildAgentValidationInterface(agentId, validations, language = ProgrammingLanguages.CSHARP) {
    let methods = validations.map(Validation => {
        return GetValidationMethodInterface(Validation, language);
    }).filter(x => x).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/validation/validation_interface.tpl', 'utf8');
    let validation_entries = GetValidationEntries(agentId, true, language);

    return bindTemplate(template, {
        agent_type: GetCodeName(agentId),
        validations: validation_entries.join(NEW_LINE),
        methods
    });
}

export function BuildAgentValidationImplementation(agentId, validations, language = ProgrammingLanguages.CSHARP) {
    let methods = validations.map(validation_ => {
        return GetValidationMethodImplementation(validation_, language);
    }).filter(x => x).join(NEW_LINE);
    let validation_entries = GetValidationEntries(agentId, false, language);
    let template = fs.readFileSync('./app/templates/validation/validations_impl.tpl', 'utf8');
    let _constructTemplate = fs.readFileSync('./app/templates/validation/constructor.tpl', 'utf8');
    let constructor = bindTemplate(_constructTemplate, {
        agent_type: `${GetCodeName(agentId)}`,
        arbiters: GetArbiterPropertyImplementations(4, language)
    });
    return bindTemplate(template, {
        agent_type: GetCodeName(agentId),
        arbiters: GetArbiterPropertyDefinitions(),
        validations: validation_entries.join(NEW_LINE),
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
            return parameters.map(t => `${GetCodeName(t.paramClass) || t.paramClass} ${safeFormatTemplateProperty(t.paramProperty && t.paramProperty.key ? t.paramProperty.key : t.paramProperty)}`).join(', ');

    }
}