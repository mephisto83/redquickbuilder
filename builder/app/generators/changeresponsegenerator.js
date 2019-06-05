import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_CHANGE_CLASS_EXTENSION = './app/templates/stream_process/stream_process_response_class_extention.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR = './app/templates/stream_process/stream_process_response_class_extention_constructor.tpl';

const PROPERTY_TABS = 6;
export default class ChangeResponseGenerator {
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
                constructors: constructors.join(jNL)
            });

            result[GetNodeProp(model, NodeProperties.CodeName)] = {
                id: GetNodeProp(model, NodeProperties.CodeName),
                name: `${GetNodeProp(model, NodeProperties.CodeName)}Response`,
                template: NamespaceGenerator.Generate({
                    template: streamProcessChangeClassExtension,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Constants}`,
                        `${namespace}${NameSpace.Model}`],
                    namespace,
                    space: NameSpace.Parameters
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