import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph, GetLinkProperty, GetCodeName, GetMethodPropNode, GetLinkChainItem } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, MakeConstant, CreateStringList, STANDARD_CONTROLLER_USING, NEW_LINE, STANDARD_TEST_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, ConditionTypes, ConditionTypeParameters, ConditionCases, FunctionTemplateKeys, MethodFunctions, FunctionTypes } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import ExtensionGenerator from './extensiongenerator';
import { debug } from 'util';
import { enumerate } from '../utils/utils';

const TEST_CASE = './app/templates/permissions/tests/test_case.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const TEST_CASE_PROPERTY = './app/templates/permissions/tests/test_case_property.tpl';
const PERMISSIONS_INTERFACE = './app/templates/permissions/permissions_interface.tpl';
const PERMISSIONS_CASE_EXTENSION = './app/templates/permissions/permissions_case.tpl';
const PERMISSIONS_CASE_ENUMERATION = './app/templates/permissions/permissions_case_enumeration.tpl';
const PERMISSIONS_CASE_INCLUDED_IN_LIST = './app/templates/permissions/permissions_case_included_in_list.tpl';
const PERMISSIONS_METHODS = './app/templates/permissions/permissions_method.tpl';
const PERMISSIONS_ARBITER_PROP = './app/templates/permissions/permissions_arbiter_prop.tpl';
const PERMISSIONS_IMPL = './app/templates/permissions/permissions_impl.tpl';
const PERMISSIONS_INTERFACE_METHODS = './app/templates/permissions/permissions_interface_methods.tpl';
const MATCH_TO_MANY_REFERENCE_PARAMETER = './app/templates/permissions/match-many-reference-parameter.tpl';
const MATCH_REFERENCE = './app/templates/permissions/match-reference.tpl';

const PROPERTY_TABS = 6;
export default class PermissionGenerator {
    static PermissionMatches(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);
        var requestorPermissionLinks = GraphMethods.getNodesByLinkType(graph, { id: permission.id, type: LinkType.RequestorPermissionLink });
        if (requestorPermissionLinks && requestorPermissionLinks[0] && requestorPermissionLinks[0].id === agent.id) {
            var appliedPermissionLink = GraphMethods.getNodesByLinkType(graph, { id: permission.id, type: LinkType.AppliedPermissionLink });
            if (appliedPermissionLink && appliedPermissionLink[0] && appliedPermissionLink[0].id === model.id) {
                return true;
            }
        }
        var manyToManyLink = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.ManyToManyPermissionLink
        });
        if (manyToManyLink && GetNodeProp(manyToManyLink[0], NodeProperties.LogicalChildrenTypes)) {
            let logicalChildrenTypes = GetNodeProp(manyToManyLink[0], NodeProperties.LogicalChildrenTypes);
            var temp = [agent.id, model.id].unique(x => x).intersection(logicalChildrenTypes);
            var temp_relCompliment = [agent.id, model.id].unique(x => x).relativeCompliment(logicalChildrenTypes)
            if (temp.length === logicalChildrenTypes.length && temp_relCompliment.length === 0) {
                return true;
            }
        }

        return false;
    }
    static createInstanceEnumerationListName(dNode, enu, method, type = 'Enums') {
        return `list${type}${GetNodeProp(dNode, NodeProperties.CodeName) || dNode}${GetNodeProp(enu, NodeProperties.CodeName) || enu}${method}`
    }

    static _createConstantList(name, constants) {
        let result = constants.map(ea => {
            return `${name}.${MakeConstant(ea)}`
        })
        return result;
    }
    //Deprecated
    static _createEnumerationInstanceList(dpNode, enumerationNode, method) {
        var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
        let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
        let constants_allowed = ext_allowed.map(ea => {
            return `${enumerationName}.${MakeConstant(ea)}`
        })
        return constants_allowed;
    }
    static _getNotAllowedConstances(dpNode, enumerationNode, method) {
        var ext_disallowed = GetNodeProp(dpNode, NodeProperties.DisallowedEnumValues) || [];
        let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
        let constants_notallowed = ext_disallowed.map(ea => {
            return `${enumerationName}.${MakeConstant(ea)}`
        })
        return constants_notallowed
    }
    static createEnumerationInstanceList(dpNode, enumerationNode, method) {

        let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
        let constants_allowed = PermissionGenerator._createEnumerationInstanceList(dpNode, enumerationNode, method);
        // var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
        // let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
        // let constants_allowed = ext_allowed.map(ea => {
        //     return `${enumerationName}.${MakeConstant(ea)}`
        // })
        return `var ${name} = new List<string> { ${constants_allowed.map(t => jNL + Tabs(5) + t).join()} ${jNL + Tabs(5)}};${jNL}`
    }
    static createStringList(options) {
        var { name, constants_allowed, enumerationName } = options;
        constants_allowed = constants_allowed.map(ea => {
            return `${enumerationName}.${MakeConstant(ea)}`
        });

        return `var ${name} = new List<string> { ${constants_allowed.map(t => jNL + Tabs(5) + t).join()} ${jNL + Tabs(5)}};${jNL}`
    }
    static _createExtensionInstanceList(dpNode, extensionNode, method, type = 'Enums') {
        var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedExtensionValues) || [];
        let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);


        let constants_allowed = ext_allowed.map(ea => {
            return `${extensionName}.${MakeConstant(ea)}`
        });

        return constants_allowed;

    }
    static _getNotAllowedExtectionConstances(dpNode, extensionNode, method, type = 'Enums') {
        var ext_disallowed = GetNodeProp(dpNode, NodeProperties.DisallowedExtensionValues) || [];
        let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);


        let constants_disallowed = ext_disallowed.map(ea => {
            return `${extensionName}.${MakeConstant(ea)}`
        });

        return constants_disallowed;

    }
    static createExtensionInstanceList(dpNode, extensionNode, method, type = 'Enums') {
        let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extensionNode, method, 'Extensions');

        let constants_allowed = PermissionGenerator._createExtensionInstanceList(dpNode, extensionNode, method, type);

        return `var ${name} = new List<string> { ${constants_allowed.map(t => jNL + Tabs(5) + t).join()} ${jNL + Tabs(5)}};${jNL}`

    }
    static IsRequestor(graph, model, permission) {
        var requestorNodes = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.RequestorPermissionLink
        });
        return !!requestorNodes.find(node => {
            return node.id === model.id;
        })
    }
    static GetExtensionNodeValues(graph, permission, method, agent, model) {
        const value_string = 'value';
        var dependingPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.PermissionPropertyDependency
        });
        let listOfCases = [];
        dependingPermissionNodes.map(dpNode => {
            let propertyNodeLinkedToByDependencyPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
                id: dpNode.id,
                type: LinkType.PermissionPropertyDependency
            });

            let propertyNodeLinkedToByDependencyPermissionNode = propertyNodeLinkedToByDependencyPermissionNodes[0];
            if (!propertyNodeLinkedToByDependencyPermissionNode) {
                return;
            }
            let propertyNodes = GraphMethods.getNodesByLinkType(graph, {
                id: propertyNodeLinkedToByDependencyPermissionNode.id,
                type: LinkType.PermissionDependencyProperty
            });
            let propertyNode = null;
            if (propertyNodes.length === 1) {
                propertyNode = propertyNodes[0];
            }
            else {
                return;
            }
            var agentLinkExists = GraphMethods.existsLinkBetween(graph, { target: propertyNode.id, source: agent.id, type: LinkType.PropertyLink });
            let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.Enumeration));
            let extentionNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.UIExtension));
            let useEnumeration = GetNodeProp(dpNode, NodeProperties.UseEnumeration);
            let useExtension = GetNodeProp(dpNode, NodeProperties.UseExtension);
            let useIncludedInList = GetNodeProp(dpNode, NodeProperties.IncludedInList);

            if (useIncludedInList) {
                let permissionCaseIncludedInList = fs.readFileSync(PERMISSIONS_CASE_INCLUDED_IN_LIST, 'utf-8');
                var tempBindingValues = {
                    method,
                    // It currently happens to be that this is correct, but maybe in the future this needs to be more general.
                    parent: `${GetNodeProp(agent, NodeProperties.AgentName) || 'agent'}`.toLowerCase(),
                    parent_property: 'Id',
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
                    value: `${agentLinkExists ? 'value' : 'data'}`.toLowerCase(),
                    value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                    model: 'data',
                    casename: GetNodeProp(dpNode, NodeProperties.CodeName),
                    extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
                    instance_list: ''
                };
                let temp = bindTemplate(permissionCaseIncludedInList, tempBindingValues);

                listOfCases.push({
                    variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
                    template: temp
                });
            }
            if (useEnumeration) {
                let permissionCaseEnumerationTemplate = fs.readFileSync(PERMISSIONS_CASE_ENUMERATION, 'utf-8');
                let enumInstance = PermissionGenerator.createEnumerationInstanceList(dpNode, enumerationNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
                var tempBindingValues = {
                    method,
                    value: `${agentLinkExists ? 'value' : 'data'}`.toLowerCase(),
                    value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    casename: GetNodeProp(dpNode, NodeProperties.CodeName),
                    'allowed-values-list': name,
                    extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
                    instance_list: enumInstance
                };
                let temp = bindTemplate(permissionCaseEnumerationTemplate, tempBindingValues);

                listOfCases.push({
                    variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
                    template: temp
                });

            }

            if (useExtension) {
                let definition = GetNodeProp(extentionNode, NodeProperties.UIExtensionDefinition);
                let permissionCaseExtensionTemplate = fs.readFileSync(PERMISSIONS_CASE_EXTENSION, 'utf-8');
                let extensionInstance = PermissionGenerator.createExtensionInstanceList(dpNode, extentionNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extentionNode, method, 'Extensions');
                let tempBindingValues = {
                    method,
                    value: `value`,
                    value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                    model: 'data',
                    casename: GetNodeProp(dpNode, NodeProperties.CodeName),
                    extension_propery_key: definition && definition.config ? definition.config.keyField : null,
                    extension_value_property: 'Value',
                    'allowed-values-list': name,
                    extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
                    instance_list: extensionInstance
                };
                let temp = bindTemplate(permissionCaseExtensionTemplate, tempBindingValues);

                listOfCases.push({
                    variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
                    template: temp
                });
            }
        });

        return listOfCases;
    }
    static IsAppliedPermission(graph, permission, propertyNode) {
        let appliedPermissionLinks = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.AppliedPermissionLink
        });
        //
        if (appliedPermissionLinks && appliedPermissionLinks.length) {
            var link = GraphMethods.GetLinkByNodes(graph, {
                source: appliedPermissionLinks[0].id,
                target: propertyNode.id
            });
            if (link) {
                return true;
            }
        }
        return false;
    }
    static GetTestExtensionNodeValues(graph, permission, method, agent, model) {
        const value_string = 'value';
        var conditionNodes = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.Condition
        });
        let listOfCases = [];
        conditionNodes.map(conditionNode => {

            // let isAppliedPermission = PermissionGenerator.IsAppliedPermission(graph, permission, propertyNode);
            // let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(conditionNode, NodeProperties.Enumeration));
            // let extentionNode = GraphMethods.GetNode(graph, GetNodeProp(conditionNode, NodeProperties.UIExtension));
            let conditionType = GetNodeProp(conditionNode, NodeProperties.ConditionType);
            switch (conditionType) {
                case ConditionTypes.MatchReference:
                    var mmrp = GetNodeProp(conditionNode, NodeProperties.MatchReference);
                    listOfCases.push({
                        type: conditionType,
                        values: [ConditionCases[ConditionTypes.MatchReference].$matching],
                        neg: [ConditionCases[ConditionTypes.MatchReference].notmatching],
                        options: { ...mmrp }
                    })

                    break;
                case ConditionTypes.MatchManyReferenceParameter:
                    var mmrp = GetNodeProp(conditionNode, NodeProperties.MatchManyReferenceParameter);
                    listOfCases.push({
                        type: conditionType,
                        values: [ConditionCases[ConditionTypes.MatchManyReferenceParameter].$matching],
                        neg: [ConditionCases[ConditionTypes.MatchManyReferenceParameter].notmatching],
                        options: { ...mmrp }
                    })

                    break;
                case ConditionTypes.InEnumerable:

                    var enumRef = GetNodeProp(conditionNode, NodeProperties.EnumerationReference);
                    var enumerationNodeName = PermissionGenerator.getReferencedNodeName(graph, enumRef, NodeProperties.Enumeration);
                    var constList = PermissionGenerator.getReference(enumRef, NodeProperties.AllowedEnumValues);
                    var disAllowedConstList = PermissionGenerator.getReference(enumRef, NodeProperties.DisallowedEnumValues);
                    let enumInstance = PermissionGenerator._createConstantList(enumerationNodeName, constList);
                    let enumNotAllowed = PermissionGenerator._createConstantList(enumerationNodeName, disAllowedConstList);;
                    let nameEnum = PermissionGenerator.createInstanceEnumerationListName(conditionNode, enumerationNodeName, method);
                    let propertyEnum = PermissionGenerator.getReferencedNodeName(graph, enumRef, ConditionTypeParameters.Ref1Property);

                    listOfCases.push({
                        type: conditionType,
                        name: nameEnum,
                        ref: enumRef[ConditionTypeParameters.Ref1],
                        property: propertyEnum,
                        values: enumInstance,
                        neg: enumNotAllowed,
                        options: { ...enumRef }
                    });

                    break;
                case ConditionTypes.InExtension:
                    let definition = GetNodeProp(conditionNode, NodeProperties.UIExtensionDefinition);
                    let extensionInstance = PermissionGenerator._createExtensionInstanceList(conditionNode, extentionNode, method);
                    let extensionsNotAllowed = PermissionGenerator._getNotAllowedExtectionConstances(conditionNode, extentionNode, method);
                    let nameExt = PermissionGenerator.createInstanceEnumerationListName(conditionNode, extentionNode, method, 'Extensions');
                    let propertyExt = GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName);
                    // definition && definition.config ? definition.config.keyField : null;

                    listOfCases.push({
                        type: conditionType,
                        name: nameExt,
                        property: propertyExt,
                        values: extensionInstance,
                        neg: extensionsNotAllowed,
                        options: { ...definition }
                    });
                    break;
            }



        });

        return listOfCases;
    }
    static getReferencedNodeName(graph, enumRef, type) {
        return GetNodeProp(PermissionGenerator.getReferencedValue(graph, enumRef, type), NodeProperties.CodeName);
    }
    static getReferencedValue(graph, enumRef, type) {
        return GraphMethods.GetNode(graph, enumRef[type])
    }
    static getReference(enumRef, type) {
        return enumRef[type]
    }
    static GenerateCases(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);
        let _manyToManyMatchCondition = fs.readFileSync(MATCH_TO_MANY_REFERENCE_PARAMETER, 'utf-8');
        let _matchReferenceCondition = fs.readFileSync(MATCH_REFERENCE, 'utf-8');
        let result = {};
        if (permission) {
            for (var method in Methods) {
                var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
                if (permissionsEnabledFor && permissionsEnabledFor[method]) {
                    let cases = [];
                    let conditions = GraphMethods.GetLinkChain(state, {
                        id: permission.id,
                        links: [{
                            type: LinkType.Condition,
                            direction: GraphMethods.SOURCE
                        }]
                    });
                    if (conditions && conditions.length) {
                        conditions.map((t, index) => {
                            var variable = 'variable_' + index;
                            switch (GetNodeProp(t, NodeProperties.ConditionType)) {
                                case ConditionTypes.MatchReference:
                                    var mmrp = GetNodeProp(t, NodeProperties.MatchReference);
                                    if (mmrp) {
                                        var propNode = GraphMethods.GetNode(graph, mmrp[ConditionTypeParameters.Ref1]);
                                        var methods = GraphMethods.GetLinkChain(state, {
                                            id: permission.id,
                                            links: [{
                                                type: LinkType.Condition,
                                                direction: GraphMethods.TARGET
                                            }, {
                                                type: LinkType.FunctionOperator,
                                                direction: GraphMethods.TARGET
                                            }]
                                        });
                                        let method = methods.find(x => x);
                                        if (method) {
                                            let methodProps = GetNodeProp(method, NodeProperties.MethodProps);
                                            if (methodProps) {
                                                var ref1UseId = mmrp[ConditionTypeParameters.Ref1UseId];// GraphMethods.GetNode(graph, methodProps[mmrp[ConditionTypeParameters.Ref1UseId]]);
                                                var ref2UseId = mmrp[ConditionTypeParameters.Ref2UseId];// GraphMethods.GetNode(graph, methodProps[mmrp[ConditionTypeParameters.Ref2UseId]]);
                                                cases.push({
                                                    template: bindTemplate(_matchReferenceCondition, {
                                                        variable,
                                                        value_property: ref1UseId ? 'Id' : '',
                                                        data_property: ref2UseId ? 'Id' : '',
                                                        relationship: GetNodeProp(relationship, NodeProperties.CodeName),
                                                        property: GetNodeProp(propNode, NodeProperties.CodeName)
                                                    }),
                                                    variable
                                                });
                                            }
                                        }
                                    }
                                    break;
                                case ConditionTypes.MatchManyReferenceParameter:
                                    var mmrp = GetNodeProp(t, NodeProperties.MatchManyReferenceParameter);
                                    if (mmrp) {
                                        var propNode = GraphMethods.GetNode(graph, mmrp[ConditionTypeParameters.RefManyToManyProperty]);
                                        var methods = GraphMethods.GetLinkChain(state, {
                                            id: permission.id,
                                            links: [{
                                                type: LinkType.Condition,
                                                direction: GraphMethods.TARGET
                                            }, {
                                                type: LinkType.FunctionOperator,
                                                direction: GraphMethods.TARGET
                                            }]
                                        });
                                        let method = methods.find(x => x);
                                        if (method) {
                                            let methodProps = GetNodeProp(method, NodeProperties.MethodProps);
                                            if (methodProps) {
                                                var relationship = GraphMethods.GetNode(graph, methodProps[mmrp[ConditionTypeParameters.RefManyToMany]]);
                                                cases.push({
                                                    arbiter: GetNodeProp(relationship, NodeProperties.CodeName),
                                                    template: bindTemplate(_manyToManyMatchCondition, {
                                                        variable,
                                                        relationship: GetNodeProp(relationship, NodeProperties.CodeName),
                                                        property: GetNodeProp(propNode, NodeProperties.CodeName)
                                                    }),
                                                    variable
                                                });
                                            }
                                        }
                                    }
                                    break;
                                case ConditionTypes.InEnumerable:
                                    var ine = GetNodeProp(t, NodeProperties.EnumerationReference);
                                    if (ine) {
                                        let ref1 = ine[ConditionTypeParameters.Ref1];

                                        let enumerationNode = GraphMethods.GetNode(graph, ine[NodeProperties.Enumeration]);
                                        if (enumerationNode) {
                                            let casename = GetNodeProp(t, NodeProperties.CodeName) || GetNodeProp(t, NodeProperties.NODEType);
                                            let name = `${casename}_valid_items`;
                                            let permissionCaseEnumerationTemplate = fs.readFileSync(PERMISSIONS_CASE_ENUMERATION, 'utf-8');
                                            let enumInstance = PermissionGenerator.createStringList({
                                                name,
                                                constants_allowed: ine[NodeProperties.AllowedEnumValues],
                                                enumerationName: GetNodeProp(enumerationNode, NodeProperties.CodeName)
                                            });
                                            let propertyNodeLinkedToByDependencyPermissionNode = GraphMethods.GetNode(graph, ine[ConditionTypeParameters.Ref1Property])
                                            var tempBindingValues = {
                                                method,
                                                value: `${ref1 !== 'model' ? 'value' : 'data'}`.toLowerCase(),
                                                value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                                                model: GetNodeProp(model, NodeProperties.CodeName) || GetNodeProp(model, NodeProperties.NODEType),
                                                casename,
                                                'allowed-values-list': name,
                                                instance_list: enumInstance
                                            };
                                            let temp = bindTemplate(permissionCaseEnumerationTemplate, tempBindingValues);

                                            cases.push({
                                                variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
                                                template: temp
                                            });

                                        }
                                    }
                                    break;
                            }
                        })
                    }
                    result[method] = cases;
                }
            }
        }
        return result;
    }

    static EnumerateCases(cases) {
        let vects = cases.map(x => {
            return (x && x.values ? x.values.length : 0) + (x && x.neg ? x.neg.length : 0);
        });
        return enumerate(vects);
    }
    static EnumeratePermissionCases(graph, permission, method, agent, model) {
        if (!permission || !method || !agent || !model) {
            return [];
        }

        let cases = PermissionGenerator.GetTestExtensionNodeValues(graph, permission, method, agent, model);
        let enums = PermissionGenerator.EnumerateCases(cases);
        let testCaseProperty = fs.readFileSync(TEST_CASE_PROPERTY, 'utf-8');
        let methodNode = GetLinkChainItem({
            id: permission.id,
            links: [{
                type: LinkType.FunctionOperator,
                direction: GraphMethods.TARGET
            }]
        });

        let methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps);

        let res = enums.map((_enum) => {
            let props = [];
            let properties = [];
            let ispositive = true;
            _enum.map((which, index) => {
                let _case = cases[index];
                ispositive = ispositive && _case.values.length > which;
                let is_model_parameter;
                switch (_case.type) {
                    case ConditionTypes.MatchManyReferenceParameter:
                        if (_case.options &&
                            _case.options[ConditionTypeParameters.Ref1] &&
                            _case.options[ConditionTypeParameters.Ref2] &&
                            methodProps &&
                            methodProps[_case.options[ConditionTypeParameters.Ref1]] &&
                            methodProps[_case.options[ConditionTypeParameters.Ref2]] &&
                            _case.options[ConditionTypeParameters.Ref1] !== _case.options[ConditionTypeParameters.Ref2]) {
                            let ref2Model = _case.options[ConditionTypeParameters.Ref2];
                            switch (_case.options[ConditionTypeParameters.Ref2]) {
                                case FunctionTemplateKeys.AgentType:
                                    throw 'this should be agent now';
                            }
                            if (ref2Model) {
                                let ref1Property = 'Id';
                                if (!_case.options[ConditionTypeParameters.Ref1UseId]) {
                                    ref1Property = _case.options[ConditionTypeParameters.Ref1Property]
                                }
                                let template;
                                let propType = _case.options[ConditionTypeParameters.Ref1];

                                let ref1 = GetMethodPropNode(graph, methodNode, _case.options[ConditionTypeParameters.Ref1]);
                                let ref2 = GetMethodPropNode(graph, methodNode, _case.options[ConditionTypeParameters.Ref2]);
                                let refManyToMany = GetMethodPropNode(graph, methodNode, _case.options[ConditionTypeParameters.RefManyToMany]);
                                let many_to_many_register = fs.readFileSync('./app/templates/permissions/tests/many_to_many_register.tpl', 'utf-8');

                                switch (propType) {
                                    case FunctionTemplateKeys.Agent:
                                    case FunctionTemplateKeys.Model:
                                    case FunctionTemplateKeys.Parent:
                                        template = bindTemplate(testCaseProperty, {
                                            model: propType,
                                            property: `.${ref1Property}`,
                                            value: `${ref2Model}.Id`
                                        });
                                        props.push({
                                            props: template,
                                            templates: {
                                                many_to_many: GetCodeName(refManyToMany),
                                                many_to_many_register: bindTemplate(many_to_many_register, {
                                                    ref1type: GetCodeName(ref1),
                                                    ref1: _case.options[ConditionTypeParameters.Ref1],
                                                    ref2type: GetCodeName(ref2),
                                                    ref2: _case.options[ConditionTypeParameters.Ref2],
                                                })
                                            },
                                            type: _case.type
                                        });
                                        properties.push({
                                            property: `.${ref1Property}`,
                                            value: `${ref2Model}.Id`
                                        });
                                        break;
                                    case FunctionTemplateKeys.AgentType:
                                        throw 'This should be agent now';
                                    default:
                                        throw 'this hasnt been defined yet';
                                }
                            }
                        }
                        break;
                    case ConditionTypes.MatchReference:

                        if (_case.options &&
                            _case.options[ConditionTypeParameters.Ref1] &&
                            _case.options[ConditionTypeParameters.Ref2] &&
                            _case.options[ConditionTypeParameters.Ref1] !== _case.options[ConditionTypeParameters.Ref2]) {
                            let ref2Model = _case.options[ConditionTypeParameters.Ref2];
                            switch (_case.options[ConditionTypeParameters.Ref2]) {
                                case FunctionTemplateKeys.AgentType:
                                    throw 'this should be agent now';
                            }

                            if (ref2Model) {
                                let ref1Property = 'Id';
                                if (!_case.options[ConditionTypeParameters.Ref1UseId]) {
                                    ref1Property = _case.options[ConditionTypeParameters.Ref1Property]
                                }
                                let template;
                                let propType = _case.options[ConditionTypeParameters.Ref1];
                                switch (propType) {
                                    case FunctionTemplateKeys.Agent:
                                    case FunctionTemplateKeys.Model:
                                    case FunctionTemplateKeys.Parent:
                                        template = bindTemplate(testCaseProperty, {
                                            model: propType,
                                            property: `.${ref1Property}`,
                                            value: `${ref2Model}.Id`
                                        });
                                        props.push({
                                            props: template,
                                            type: ConditionTypes.MatchReference
                                        });
                                        properties.push({
                                            property: `.${ref1Property}`,
                                            value: `${ref2Model}.Id`
                                        });
                                        break;
                                    case FunctionTemplateKeys.AgentType:
                                        throw 'This should be agent now';
                                    default:
                                        throw 'this hasnt been defined yet';
                                }
                            }
                        }
                        break;
                    default:
                        is_model_parameter = _case.ref === 'model';
                        let value = _case.values.length <= which ? _case.neg[which - _case.values.length] : _case.values[which];
                        let temp = bindTemplate(testCaseProperty, {
                            model: is_model_parameter ? 'model' : 'agent', // THis may need to expand
                            property: `.${_case.property}`,
                            value: value
                        });
                        if (is_model_parameter) {
                            props.push({ props: temp, type: FunctionTemplateKeys.Model });
                            properties.push({
                                props: {
                                    property: _case.property,
                                    value
                                },
                                type: FunctionTemplateKeys.Model
                            })
                        }
                        else {
                            props.push({ props: temp, type: FunctionTemplateKeys.Agent });
                            properties.push({
                                props: {
                                    property: _case.property,
                                    value
                                },
                                type: FunctionTemplateKeys.Agent
                            })
                        }
                        break;
                }

            });
            return {
                props: [
                    ...props
                ],
                properties: [
                    ...properties
                ],
                resultSuccess: ispositive
            }
        });

        return res;
    }
    static GenerateTestCases(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);
        let parent = null;
        let manyToMany = null;
        let many_to_many_register = '';
        let testCase = fs.readFileSync(TEST_CASE, 'utf-8');
        let result = [];
        let methodNode = permission ? GetLinkChainItem({
            id: permission.id,
            links: [{
                type: LinkType.FunctionOperator,
                direction: GraphMethods.TARGET
            }]
        }) : null;
        parent = GetMethodPropNode(graph, methodNode, FunctionTemplateKeys.Parent);
        manyToMany = GetMethodPropNode(graph, methodNode, FunctionTemplateKeys.ManyToManyModel);

        switch (GetNodeProp(methodNode, NodeProperties.FunctionType)) {
            case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
                testCase = fs.readFileSync('./app/templates/permissions/tests/Get_ManyToMany_Agent_Value__IListChild.tpl', 'utf-8');
                break;
            case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
                testCase = fs.readFileSync('./app/templates/permissions/tests/Get_Parent$Child_Agent_Value__IListChild.tpl', 'utf-8');
                break;
        }
        if (methodNode) {
            for (var method in Methods) {
                var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
                if (permission && permissionsEnabledFor && permissionsEnabledFor[method]) {
                    let res = PermissionGenerator.EnumeratePermissionCases(graph, permission, method, agent, model);

                    res = res.map((t, testIndex) => {
                        var { props, resultSuccess, templates = {} } = t;
                        return bindTemplate(testCase, {
                            set_agent_properties: props.filter(x => x.type === FunctionTemplateKeys.Agent).map(t => t.props).join(NEW_LINE),
                            set_model_properties: props.filter(x => x.type === FunctionTemplateKeys.Model).map(t => t.props).join(NEW_LINE),
                            set_parent_properties: props.filter(x => x.type === FunctionTemplateKeys.Parent).map(t => t.props).join(NEW_LINE),
                            set_match_reference_properties: props.filter(x => x.type === ConditionTypes.MatchReference).map(t => t.props).join(NEW_LINE),
                            set_match_many_reference_properties: props.filter(x => x.type === ConditionTypes.MatchManyReferenceParameter).map(t => t.props).join(NEW_LINE),
                            agent_type: GetCodeName(agent),
                            model: GetCodeName(model),
                            manyToMany: GetCodeName(manyToMany),
                            many_to_many_register,
                            parent: GetCodeName(parent),
                            method,
                            test: `_${GetCodeName(agent)}_${GetCodeName(model)}_${method}_${testIndex}`,
                            result: resultSuccess ? 'true' : 'false',
                            function_name: GetCodeName(permission) + method,
                            ...templates
                        });
                    })
                    result = [...result, ...res];
                }
            }
        }
        return result;
    }
    // static GenerateTestCases(state, permission, agent, model) {
    //     var graph = GetCurrentGraph(state);
    //     let testCase = fs.readFileSync(TEST_CASE, 'utf-8');
    //     let result = []
    //     for (var method in Methods) {
    //         var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
    //         if (permission && permissionsEnabledFor && permissionsEnabledFor[method]) {
    //             let res = PermissionGenerator.EnumeratePermissionCases(graph, permission, method, agent, model);
    //             res = res.map((t, testIndex) => {
    //                 var { agentProps, itemProps, resultSuccess } = t;
    //                 return bindTemplate(testCase, {
    //                     set_agent_properties: agentProps.join(NEW_LINE),
    //                     set_model_properties: itemProps.join(NEW_LINE),
    //                     agent_type: GetNodeProp(agent, NodeProperties.CodeName),
    //                     model: GetNodeProp(model, NodeProperties.CodeName),
    //                     method,
    //                     test: `_${GetNodeProp(agent, NodeProperties.CodeName)}_${GetNodeProp(model, NodeProperties.CodeName)}_${method}_${testIndex}`,
    //                     result: resultSuccess ? 'true' : 'false',
    //                     function_name: GetNodeProp(permission, NodeProperties.CodeName) + method
    //                 });
    //             })
    //             result = [...result, ...res];
    //         }
    //     }
    //     return result;
    // }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let permissions = NodesByType(state, NodeTypes.Permission);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let graphRoot = GetRootGraph(state);

        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _testTemplate = fs.readFileSync(TEST_CLASS, 'utf-8');
        let _permissionInterface = fs.readFileSync(PERMISSIONS_INTERFACE, 'utf-8');
        let _permissionImplementation = fs.readFileSync(PERMISSIONS_IMPL, 'utf-8');
        let _permissionInterfaceMethods = fs.readFileSync(PERMISSIONS_INTERFACE_METHODS, 'utf-8');
        let _permissionMethods = fs.readFileSync(PERMISSIONS_METHODS, 'utf-8');
        let _permissionArbiters = fs.readFileSync(PERMISSIONS_ARBITER_PROP, 'utf-8');
        let result = {};

        agents.map(agent => {
            var agentPermissionFunctions = {};
            let streamProcessChangeClassExtension = _permissionImplementation;
            let permissionInterface = _permissionInterface;
            let testPermission = _testTemplate;
            let methodImplementations = [];
            let methodInterfaces = [];
            let testMethodPermisionCases = [];
            let arbiters = [];
            models.map(model => {
                let matchingPermissionNodes = permissions.filter(permission => PermissionGenerator.PermissionMatches(state, permission, agent, model));
                if (!matchingPermissionNodes || !matchingPermissionNodes.length) {
                    return;
                }
                let permissionCases = [];
                let permissionCodeNames = [];
                matchingPermissionNodes.map(matchingPermissionNode => {
                    if (matchingPermissionNode) {
                        permissionCodeNames.push(GetNodeProp(matchingPermissionNode, NodeProperties.CodeName));
                        let temp = PermissionGenerator.GenerateCases(state, matchingPermissionNode, agent, model);
                        let testTemp = PermissionGenerator.GenerateTestCases(state, matchingPermissionNode, agent, model);
                        permissionCases.push(temp);
                        testMethodPermisionCases.push(...testTemp);
                    }
                })
                permissionCases.map((perms, index) => {
                    for (var permKey in perms) {
                        let cases = perms[permKey];
                        cases.map(t => {
                            if (t && t.arbiter) {
                                arbiters.push(t);
                            }
                        })
                        let permissionMethods = _permissionMethods;
                        let permissionInterfaceMethods = _permissionInterfaceMethods;
                        permissionMethods = bindTemplate(permissionMethods, {
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            value: `data`,
                            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                            function_name: permissionCodeNames[index] + permKey,
                            agent: `value`,
                            method: permKey,
                            cases: cases.map(c => jNL + Tabs(4) + c.template).join(''),
                            case_result: jNL + Tabs(4) + `result = ${cases.map(c => c.variable).join(' && ')};`
                        });
                        permissionInterfaceMethods = bindTemplate(permissionInterfaceMethods, {
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            function_name: permissionCodeNames[index] + permKey,
                            value: `data`,
                            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                            agent: `value`,
                            method: permKey
                        });
                        methodInterfaces.push(permissionInterfaceMethods);
                        methodImplementations.push(permissionMethods);

                    }
                });
            }).join(jNL);
            arbiters = arbiters.map(t => t.arbiter).unique(x => x).map(t => {
                return bindTemplate(_permissionArbiters, {
                    arbiter: t
                })
            }).join(jNL)
            streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                arbiters,
                methods: methodImplementations.join(jNL + jNL)
            });
            permissionInterface = bindTemplate(permissionInterface, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                methods: methodInterfaces.join(jNL + jNL)
            });
            result[GetNodeProp(agent, NodeProperties.CodeName)] = {
                name: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}`,
                tname: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}Tests`,
                iname: `IPermissions${GetNodeProp(agent, NodeProperties.CodeName)}`,
                template: NamespaceGenerator.Generate({
                    template: streamProcessChangeClassExtension,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Extensions}`,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Interface}`,
                        arbiters && arbiters.length ? `${namespace}${NameSpace.Controllers}` : null,
                        `${namespace}${NameSpace.Constants}`].filter(x => x),
                    namespace,
                    space: NameSpace.Permissions
                }),
                interface: NamespaceGenerator.Generate({
                    template: permissionInterface,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.Model}`
                    ],
                    namespace,
                    space: NameSpace.Interface
                }),
                test: NamespaceGenerator.Generate({
                    template: bindTemplate(testPermission, {
                        tests: testMethodPermisionCases.join(NEW_LINE),
                        name: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}`
                    }),
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        ...STANDARD_TEST_USING,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.Permissions}`,
                        `${namespace}${NameSpace.Extensions}`,
                        `${namespace}${NameSpace.Constants}`,
                        `${namespace}${NameSpace.Model}`
                    ],
                    namespace,
                    space: NameSpace.Tests
                })
            };
        })

        return result;
    }
}
const NL = `
                    `
const jNL = `
`
const TAB = `   `;

function Tabs(c) {
    let res = '';
    for (var i = 0; i < c; i++) {
        res += TAB;
    }
    return res;
}