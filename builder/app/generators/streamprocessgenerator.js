import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_TEMPLATE = './app/templates/stream_process/stream_process.tpl';
const STREAM_PROCESS_FUNCTION_TEMPLATE = './app/templates/stream_process/stream_process_function.tpl';

export default class StreamProcessGenerator {
    static GenerateStaticMethods(models) {
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let _streamProcessFunctionTemplate = fs.readFileSync(STREAM_PROCESS_FUNCTION_TEMPLATE, 'utf-8');
        let staticMethods = [];
        agents.map(agent => {
            models.map(model => {
                let streamProcessFunctionTemplate = _streamProcessFunctionTemplate;
                let modelCode = GetNodeProp(model, NodeProperties.CodeName);
                let res = bindTemplate(streamProcessFunctionTemplate, {
                    model: modelCode,
                    agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                    [`model#allupper`]: modelCode.toUpperCase()
                });

                staticMethods.push(res + jNL);
            });
        });
        return staticMethods;
    }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_TEMPLATE, 'utf-8');
        let statics = StreamProcessGenerator.GenerateStaticMethods(models);
        _streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
            static_methods: statics.join('')
        })

        return {
            'StreamProcess': {
                id: 'StreamProcess',
                name: 'StreamProcess',
                template: NamespaceGenerator.Generate({
                    template: _streamProcessTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        'System.Threading',
                        `${namespace}${NameSpace.Constants}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Model}`],
                    namespace,
                    space: NameSpace.StreamProcess
                })
            }
        };
    }
}
const NL = `
`
const jNL = `
`
const TAB = `   `;