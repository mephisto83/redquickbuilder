import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph, GetLinkProperty, GetCodeName, GetMethodPropNode, GetLinkChainItem, GetPermissionMethod, GetFunctionType, GetMethodNodeProp, GetNodeCode, GetC } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, MakeConstant, CreateStringList, STANDARD_CONTROLLER_USING, NEW_LINE, STANDARD_TEST_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, ConditionTypes, ConditionTypeParameters, ConditionCases, FunctionTemplateKeys, FunctionTypes, INTERNAL_TEMPLATE_REQUIREMENTS } from '../constants/functiontypes';
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
const MANY_TO_MANY_CONSTRUCTOR = './app/templates/permissions/tests/many_to_many_constructor.tpl';
const MATCH_REFERENCE = './app/templates/permissions/match-reference.tpl';

const PROPERTY_TABS = 6;
export default class PermissionGenerator {

    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let permissions = NodesByType(state, NodeTypes.Permission);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let graphRoot = GetRootGraph(state);

        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _testTemplate = fs.readFileSync(TEST_CLASS, 'utf8');
        let _permissionInterface = fs.readFileSync(PERMISSIONS_INTERFACE, 'utf8');
        let _permissionImplementation = fs.readFileSync(PERMISSIONS_IMPL, 'utf8');
        let _permissionInterfaceMethods = fs.readFileSync(PERMISSIONS_INTERFACE_METHODS, 'utf8');
        let _permissionMethods = fs.readFileSync(PERMISSIONS_METHODS, 'utf8');
        let _permissionArbiters = fs.readFileSync(PERMISSIONS_ARBITER_PROP, 'utf8');
        let result = {};

        agents.map(agent => {
            let streamProcessChangeClassExtension = _permissionImplementation;
            let permissionInterface = _permissionInterface;
            let testPermission = _testTemplate;
            let methodImplementations = [];
            let methodInterfaces = [];
            let testMethodPermisionCases = [];
            let arbiters = [];
            models.map(model => {
                let matchingPermissionNodes = permissions.filter(permission => PermissionGenerator.PermissionMatches(permission, agent, model));
                if (!matchingPermissionNodes || !matchingPermissionNodes.length) {
                    return;
                }
                let permissionCases = [];
                let permissionCodeNames = [];
                matchingPermissionNodes.map((matchingPermissionNode, pindex) => {
                    if (matchingPermissionNode) {
                        permissionCodeNames.push(GetNodeProp(matchingPermissionNode, NodeProperties.CodeName));
                        let temp = PermissionGenerator.GenerateCases(state, matchingPermissionNode, agent, model);
                        let testTemp = PermissionGenerator.GenerateTestCases(state, matchingPermissionNode, agent, model, pindex);
                        permissionCases.push(temp);
                        testMethodPermisionCases.push(...testTemp);
                    }
                })
                permissionCases.map((perms, index) => {
                    for (var permKey in perms) {
                        let cases = perms[permKey];
                        let parent_setup = '';
                        let parent_type = '';
                        cases.map(t => {
                            if (t && t.arbiter) {
                                arbiters.push(t);
                            }
                            if (t && t.options && t.methodProps) {
                                let parms = [ConditionTypeParameters.Ref1, ConditionTypeParameters.Ref2];
                                parms.map(parm => {
                                    if (t.methodProps[t.options[parm]]) {
                                        let arbiter = GetCodeName(t.methodProps[t.options[parm]]);
                                        if (t.options[parm] === INTERNAL_TEMPLATE_REQUIREMENTS.PARENT) {
                                            if (t.methodProps.parent !== model.id)
                                                parent_type = arbiter;
                                        }
                                        if (arbiter) {
                                            arbiters.push({
                                                arbiter
                                            });
                                        }
                                    }
                                });
                            }
                        });

                        parent_setup = parent_type ? `var parent = data.${parent_type} != null ? (await arbiter${parent_type}.Get<${parent_type}>(data.${parent_type})) : null;` : 'var parent = data;';
                        let modelCodeName = GetNodeProp(model, NodeProperties.CodeName);
                        var permissionNode = matchingPermissionNodes[index];
                        let permissionValueType = GetNodeProp(permissionNode, NodeProperties.PermissionValueType)
                        var methodNode = permissionNode ? GetLinkChainItem({
                            id: permissionNode.id,
                            links: [{
                                direction: GraphMethods.TARGET,
                                type: LinkType.FunctionOperator
                            }]
                        }) : null;

                        let methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps);
                        if (permissionValueType && methodProps) {
                            modelCodeName = GetCodeName(methodProps[permissionValueType]);
                        }
                        let permissionMethods = _permissionMethods;
                        let permissionInterfaceMethods = _permissionInterfaceMethods;
                        permissionMethods = bindTemplate(permissionMethods, {
                            model: modelCodeName,
                            value: `data`,
                            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                            function_name: permissionCodeNames[index] + permKey,
                            agent: `value`,
                            parent_setup,
                            method: permKey,
                            cases: cases.map(c => jNL + Tabs(4) + c.template).join(''),
                            case_result: jNL + Tabs(4) + `result = ${cases.map(c => c.variable).join(' && ')};`
                        });
                        permissionInterfaceMethods = bindTemplate(permissionInterfaceMethods, {
                            model: modelCodeName,
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
                methods: methodImplementations.unique().join(jNL + jNL)
            });
            permissionInterface = bindTemplate(permissionInterface, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                methods: methodInterfaces.unique().join(jNL + jNL)
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