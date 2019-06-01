import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, MakeConstant, CreateStringList } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import ExtensionGenerator from './extensiongenerator';

const PERMISSIONS_INTERFACE = './app/templates/permissions/permissions_interface.tpl';
const PERMISSIONS_CASE_EXTENSION = './app/templates/permissions/permissions_case.tpl';
const PERMISSIONS_CASE_ENUMERATION = './app/templates/permissions/permissions_case_enumeration.tpl';
const PERMISSIONS_METHODS = './app/templates/permissions/permissions_method.tpl';
const PERMISSIONS_IMPL = './app/templates/permissions/permissions_impl.tpl';

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
        return false;
    }
    static createInstanceEnumerationListName(dNode, enu, method, type = 'Enums') {
        return `list${type}${GetNodeProp(dNode, NodeProperties.CodeName)}${GetNodeProp(enu, NodeProperties.CodeName)}${method}`
    }
    static createEnumerationInstanceList(dNode, enumerationNode, method) {
        let name = PermissionGenerator.createInstanceEnumerationListName(dNode, enumerationNode, method);
        var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
        let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
        let constants_allowed = ext_allowed.map(ea => {
            return `${enumerationName}.${MakeConstant(ea)}`
        })
        return `var ${name} = new List<string> { ${constants_allowed.map(t => jNL + Tabs(4)).join('')} }`
    }
    static createExtensionInstanceList(dpNode, extensionNode, method, type = 'Enums') {
        let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extensionNode, method, 'Extensions');
        var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedExtensionValues) || [];
        let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);
        // let listTemplate = ExtensionGenerator.CreateListInstanceTemplate({
        //     node: extensionNode,
        //     name
        // });
        4
        let constants_allowed = ext_allowed.map(ea => {
            return `${extensionName}.${MakeConstant(ea)}`
        });

        return `var ${name} = new List<string> { ${constants_allowed.map(t => jNL + Tabs(4)).join('')} }`

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
                type: LinkType.PermissionDependencyPropertyLink
            });
            let propertyNodeLinkedToByDependencyPermissionNode = propertyNodeLinkedToByDependencyPermissionNodes[0];
            if (!propertyNodeLinkedToByDependencyPermissionNode) {
                return;
            }
            let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.Enumeration));
            let extentionNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.UIExtension));
            let useEnumeration = GetNodeProp(dpNode, NodeProperties.UseEnumeration);
            let useExtension = GetNodeProp(dpNode, NodeProperties.UseExtension);

            debugger;
            if (useEnumeration) {
                let permissionCaseEnumerationTemplate = fs.readFileSync(PERMISSIONS_CASE_ENUMERATION, 'utf-8');
                let enumInstance = PermissionGenerator.createEnumerationInstanceList(dpNode, enumerationNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
                let temp = bindTemplate(permissionCaseEnumerationTemplate, {
                    method,
                    value: value_string,
                    value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    casename: GetNodeProp(dpNode, NodeProperties.CodeName),
                    extension_propery_key: GetNodeProp(propertyNodesForExtensions[0], NodeProperties.CodeName),
                    extension_value_property: 'Value',
                    'allowed-values-list': name,
                    instance_list: enumInstance
                });

                listOfCases.push(temp);

            }

            if (useExtension) {
                let permissionCaseExtensionTemplate = fs.readFileSync(PERMISSIONS_CASE_EXTENSION, 'utf-8');
                let extensionInstance = PermissionGenerator.createExtensionInstanceList(dpNode, extentionNode, method);
                let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extentionNode, method, 'Extensions');
                let temp = bindTemplate(permissionCaseExtensionTemplate, {
                    method,
                    value: value_string,
                    value_property: GetNodeProp(propertyNodeLinkedToByDependencyPermissionNode, NodeProperties.CodeName),
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    casename: GetNodeProp(dpNode, NodeProperties.CodeName),
                    extension_propery_key: GetNodeProp(extentionNode, NodeProperties.CodeName),
                    extension_value_property: 'Value',
                    'allowed-values-list': name,
                    instance_list: extensionInstance
                });

                listOfCases.push(temp);
            }
          
            if (false)
                if (extensionNode) {
                    var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedExtensionValues) || [];
                    var ext_disallowed = [];
                    var def = GetNodeProp(extensionNode, NodeProperties.UIExtensionDefinition);

                    let propertyNodesForExtensions = GraphMethods.getNodesByLinkType(graph, {
                        id: dpNode.id,
                        type: LinkType.Extension,
                        direction: GraphMethods.SOURCE
                    });
                    let propertyNodesForEnumerations = GraphMethods.getNodesByLinkType(graph, {
                        id: dpNode.id,
                        type: LinkType.Enumeration,
                        direction: GraphMethods.SOURCE
                    });
                    if (propertyNodesForExtensions.length || propertyNodesForEnumerations.length) {
                        if (def && def.config) {
                            if (def.config.isEnumeration) {
                                var extensionValues = def.config.list.map(t => {
                                    return def.config.keyField ? t[def.config.keyField] : t[Object.keys(t)[0]];
                                });
                                let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);
                                let listTemplate = ExtensionGenerator.CreateListInstanceTemplate({
                                    node: extensionNode,
                                    name: `list${extensionName}`
                                });

                                ext_allowed = ext_allowed.intersection(extensionValues);
                                let constants_allowed = ext_allowed.map(ea => {
                                    return `${extensionName}.${MakeConstant(ea)}`
                                })
                                ext_disallowed = extensionValues.relativeCompliment(ext_allowed);
                                let constants_notallowed = ext_disallowed.map(ea => {
                                    return `${extensionName}.${MakeConstant(ea)}`
                                });

                                let allowedListItems = CreateStringList({
                                    name: `allowedList${extensionName}`,
                                    instance: true,
                                    list: constants_allowed
                                });
                                let disallowedListItems = CreateStringList({
                                    name: `disallowedList${extensionName}`,
                                    instance: true,
                                    list: constants_notallowed
                                });

                            }
                        }
                    }
                }
        })
    }
    static GenerateCases(state, permission, agent, model) {
        var graph = GetCurrentGraph(state);

        // dependingPermissionNodes.map(dpNode => {
        //     if (GetNodeProp(dpNode, NodeProperties.UseExtension)) {
        //         var extensionNodeId = dpNode && dpNode.properties ? dpNode.properties[NodeProperties.UIExtension] : '';
        //         if (extensionNodeId) {
        //             var extensionNode = GraphMethods.GetNode(graph, extensionNodeId);
        //         }
        //     }
        // })
        for (var method in Methods) {
            PermissionGenerator.GetExtensionNodeValues(graph, permission, method, agent, model);
        }
    }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let permissions = NodesByType(state, NodeTypes.Permission);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let graphRoot = GetRootGraph(state);

        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _permissionInterface = fs.readFileSync(PERMISSIONS_INTERFACE, 'utf-8');
        let _permissionImplementation = fs.readFileSync(PERMISSIONS_IMPL, 'utf-8');
        let result = {};

        agents.map(agent => {
            var agentPermissionFunctions = {};
            models.map(model => {
                let matchingPermissionNodes = permissions.filter(permission => PermissionGenerator.PermissionMatches(state, permission, agent, model));
                if (!matchingPermissionNodes || !matchingPermissionNodes.length) {
                    return;
                }
                matchingPermissionNodes.map(matchingPermissionNode => {
                    if (matchingPermissionNode) {
                        PermissionGenerator.GenerateCases(state, matchingPermissionNode, agent, model);
                    }
                })
                let streamProcessChangeClassExtension = _permissionInterface;
                let properties = '';
                let statics = '';
                let constructors = [];
                Object.values(Methods).filter(x => x !== Methods.Get).map(method => {

                    let streamProcessChangeClassConstructors = _permissionImplementation;

                    streamProcessChangeClassConstructors = bindTemplate(streamProcessChangeClassConstructors, {
                        model: GetNodeProp(model, NodeProperties.CodeName),
                        value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
                        change_type: `Methods.${method}`,
                        method
                    });
                    constructors.push(streamProcessChangeClassConstructors);

                })
            }).join(jNL);

            streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                model: GetNodeProp(model, NodeProperties.CodeName),
                constructors
            });

            result[model.id] = {
                id: model.id,
                name: GetNodeProp(model, NodeProperties.CodeName),
                template: NamespaceGenerator.Generate({
                    template: streamProcessChangeClassExtension,
                    usings: [...STANDARD_CONTROLLER_USING, `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Parameters
                })
            };
        })

        return result;
    }
}
const STANDARD_CONTROLLER_USING = [
    'Newtonsoft.Json',
    'Newtonsoft.Json.Linq',
    'RedQuick.Data',
    'RedQuick.Attributes',
    'RedQuick.Interfaces',
    'RedQuick.Interfaces.Data',
    'RedQuick.UI',
    'System',
    'System.Collections',
    'System.Collections.Generic',
    'System.Linq',
    'System.Net',
    'System.Net.Http',
    'System.Threading.Tasks',
    'System.Web.Http'
]
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