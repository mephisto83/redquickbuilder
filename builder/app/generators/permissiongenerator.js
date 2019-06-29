import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, MakeConstant, CreateStringList, STANDARD_CONTROLLER_USING, NEW_LINE, STANDARD_TEST_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
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
const PERMISSIONS_IMPL = './app/templates/permissions/permissions_impl.tpl';
const PERMISSIONS_INTERFACE_METHODS = './app/templates/permissions/permissions_interface_methods.tpl';

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
        if (manyToManyLink && manyToManyLink.map(t => GraphMethods.GetNode(graph, t.id)).filter(x => x).length) {
            return true;
        }

        return false;
    }
    static createInstanceEnumerationListName(dNode, enu, method, type = 'Enums') {
        return `list${type}${GetNodeProp(dNode, NodeProperties.CodeName)}${GetNodeProp(enu, NodeProperties.CodeName)}${method}`
    }
    static _createEnumerationInstanceList(dpNode, enumerationNode, method) {
        var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
        let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
        let constants_allowed = ext_allowed.map(ea => {
            return `${enumerationName}.${MakeConstant(ea)}`
        })
        return constants_allowed
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
        var dependingPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.PermissionPropertyDependency
        });
        let listOfCases = [];
        dependingPermissionNodes.map(dpNode => {
            let propertyNodeLinkedToByDependencyPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
                id: dpNode.id,
                type: LinkType.PermissionPropertyDependency,
                direction: GraphMethods.SOURCE
            });
            let propertyNodeLinkedToByDependencyPermissionNode = propertyNodeLinkedToByDependencyPermissionNodes[0];
            if (!propertyNodeLinkedToByDependencyPermissionNode) {
                return;
            }
            let propertyNodes = GraphMethods.getNodesByLinkType(graph, {
                id: propertyNodeLinkedToByDependencyPermissionNode.id,
                type: LinkType.PermissionDependencyProperty,
                direction: GraphMethods.SOURCE
            });
            let propertyNode = null;
            if (propertyNodes.length === 1) {
                propertyNode = propertyNodes[0];
            }
            else {
                return;
            }
            let isAppliedPermission = PermissionGenerator.IsAppliedPermission(graph, permission, propertyNode);
            let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.Enumeration));
            let extentionNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.UIExtension));
            let useEnumeration = GetNodeProp(dpNode, NodeProperties.UseEnumeration);
            let useExtension = GetNodeProp(dpNode, NodeProperties.UseExtension);

            if (useEnumeration) {
                let enumInstance = PermissionGenerator._createEnumerationInstanceList(dpNode, enumerationNode, method);
                let enumNotAllowed = PermissionGenerator._getNotAllowedConstances(dpNode, enumerationNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
                let property = GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName);

                listOfCases.push({
                    name,
                    property,
                    values: enumInstance,
                    neg: enumNotAllowed,
                    isAppliedPermission
                });

            }

            if (useExtension) {
                let definition = GetNodeProp(extentionNode, NodeProperties.UIExtensionDefinition);
                let extensionInstance = PermissionGenerator._createExtensionInstanceList(dpNode, extentionNode, method);
                let extensionsNotAllowed = PermissionGenerator._getNotAllowedExtectionConstances(dpNode, extentionNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extentionNode, method, 'Extensions');
                let property = definition && definition.config ? definition.config.keyField : null;

                listOfCases.push({
                    name,
                    property,
                    values: extensionInstance,
                    neg: extensionsNotAllowed,
                    isAppliedPermission
                });
            }
        });

        return listOfCases;
    }
    static GenerateCases(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);

        let result = {};
        if (permission) {
            for (var method in Methods) {
                var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
                if (permissionsEnabledFor && permissionsEnabledFor[method]) {
                    let cases = PermissionGenerator.GetExtensionNodeValues(graph, permission, method, agent, model);

                    if (GetNodeProp(permission, NodeProperties.ManyToManyNexus)) {
                        let useMatchIds = GetNodeProp(permission, NodeProperties.MatchIds);
                        let useConnectionExists = GetNodeProp(permission, NodeProperties.ConnectionExists);
                        let useExcludedFromList = GetNodeProp(permission, NodeProperties.ExcludedFromList);
                        if (useMatchIds) {
                            cases.push({

                                variable: 'matchingIds',
                                template: 'value.Id == data.Id;'
                            })
                        }
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
        let res = enums.map((_enum, testIndex) => {
            let itemProps = [];
            let itemProperties = [];
            let agentProps = [];
            let agentProperties = [];
            let ispositive = true;
            _enum.map((which, index) => {
                let _case = cases[index];
                ispositive = ispositive && _case.values.length > which;
                let value = _case.values.length <= which ? _case.neg[which - _case.values.length] : _case.values[which];
                let temp = bindTemplate(testCaseProperty, {
                    model: _case.isAppliedPermission ? 'model' : 'agent',
                    property: `.${_case.property}`,
                    value: value
                });
                if (_case.isAppliedPermission) {
                    itemProps.push(temp);
                    itemProperties.push({
                        property: _case.property,
                        value
                    })
                }
                else {
                    agentProps.push(temp);
                    agentProperties.push({
                        property: _case.property,
                        value
                    })
                }
            });
            return {
                agentProps,
                itemProps,
                agentProperties,
                itemProperties,
                resultSuccess: ispositive
            }
        });

        return res;
    }
    static GenerateTestCases(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);
        let testCase = fs.readFileSync(TEST_CASE, 'utf-8');
        let result = []
        for (var method in Methods) {
            var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
            if (permission && permissionsEnabledFor && permissionsEnabledFor[method]) {
                let res = PermissionGenerator.EnumeratePermissionCases(graph, permission, method, agent, model);
                res = res.map((t, testIndex) => {
                    var { agentProps, itemProps, resultSuccess } = t;
                    return bindTemplate(testCase, {
                        set_agent_properties: agentProps.join(NEW_LINE),
                        set_model_properties: itemProps.join(NEW_LINE),
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        model: GetNodeProp(model, NodeProperties.CodeName),
                        method,
                        test: `${testIndex}`,
                        result: resultSuccess ? 'true' : 'false',
                        function_name: GetNodeProp(permission, NodeProperties.CodeName) + method
                    });
                })
                result = [...result, ...res];
            }
        }
        return result;
    }
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
        let result = {};

        agents.map(agent => {
            var agentPermissionFunctions = {};
            let streamProcessChangeClassExtension = _permissionImplementation;
            let permissionInterface = _permissionInterface;
            let testPermission = _testTemplate;
            let methodImplementations = [];
            let methodInterfaces = [];
            let testMethodPermisionCases = [];
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

            streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
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
                        `${namespace}${NameSpace.Constants}`],
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