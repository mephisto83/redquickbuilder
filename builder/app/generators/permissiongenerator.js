import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, MakeConstant, CreateStringList } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import ExtensionGenerator from './extensiongenerator';

const PERMISSIONS_INTERFACE = './app/templates/permissions/permissions_interface.tpl';
const PERMISSIONS_METHODS = './app/templates/permissions/permissions_method.tpl';
const PERMISSIONS_IMPL = './app/templates/permissions/permissions_impl.tpl';

const PROPERTY_TABS = 6;
export default class PermissionGenerator {
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += TAB;
        }
        return res;
    }
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
    static GetExtensionNodeValues(graph, extensionNode, permissionNode) {
        if (extensionNode) {
            debugger;
            var ext_allowed = (permissionNode && permissionNode.properties ? permissionNode.properties[NodeProperties.AllowedExtensionValues] : []) || [];
            var ext_disallowed = [];
            var def = GetNodeProp(extensionNode, NodeProperties.UIExtensionDefinition);

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
                        list: constants_allowed
                    });
                    let disallowedListItems = CreateStringList({
                        name: `disallowedList${extensionName}`,
                        list: constants_notallowed
                    });
                }
            }
        }
    }
    static GenerateCases(state, permission) {
        var graph = GetCurrentGraph(state);
        var dependingPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
            id: permission.id,
            type: LinkType.PermissionPropertyDependency
        });
        dependingPermissionNodes.map(dpNode => {
            if (GetNodeProp(dpNode, NodeProperties.UseExtension)) {
                let extensionValues = GetNodeProp(dpNode, NodeProperties.AllowedExtensionValues);
                var extensionNodeId = dpNode && dpNode.properties ? dpNode.properties[NodeProperties.UIExtension] : '';
                if (extensionNodeId) {
                    var extensionNode = GraphMethods.GetNode(graph, extensionNodeId);
                    var extensionNodeValues = PermissionGenerator.GetExtensionNodeValues(graph, extensionNode, permission);
                }
            }
        })
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
                        PermissionGenerator.GenerateCases(state, matchingPermissionNode);
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