import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_CHANGE_CLASS_EXTENSION = './app/templates/stream_process/stream_process_change_class_extention.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR = './app/templates/stream_process/stream_process_change_class_constructor.tpl';

const PROPERTY_TABS = 6;
export default class ChangeParameterGenerator {
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += TAB;
        }
        return res;
    }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _streamProcessChangeClassExtension = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_EXTENSION, 'utf-8');
        let _streamProcessChangeClassConstructors = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR, 'utf-8');
        let result = {};
        models.map(model => {
            let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
            let properties = '';
            let statics = '';
            let constructors = [];
            agents.map(agent => {
                Object.values(Methods).filter(x => x !== Methods.Get).map(method => {

                    let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;

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

            result[GetNodeProp(model, NodeProperties.CodeName)] = {
                id: GetNodeProp(model, NodeProperties.CodeName),
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