import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_ORCHESTRATION_TEMPLATE = './app/templates/stream_process/stream_process_orchestration.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS = './app/templates/stream_process/stream_process_orchestration_agenttype_methods.tpl';
const STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES = './app/templates/stream_process/stream_process_orchestration_selected_staged_changes.tpl';

export default class StreamProcessOrchestrationGenerator {
    static GenerateStaticMethods(models) {

        let _streamProcessFunctionTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES, 'utf-8');
        let staticMethods = models.map(model => {
            let streamProcessFunctionTemplate = _streamProcessFunctionTemplate;
            let modelCode = GetNodeProp(model, NodeProperties.CodeName);
            let res = bindTemplate(streamProcessFunctionTemplate, {
                model: modelCode,
                [`model#allupper`]: modelCode.toUpperCase()
            });

            return res + jNL
        });

        return staticMethods;
    }
    static GenerateAgentMethods(state) {
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS, 'utf-8');

        let result = [];
        agents.map(agent => {
            models.map(model => {
                var res = bindTemplate(_streamAgentMethods, {
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    'model#lower': GetNodeProp(model, NodeProperties.CodeName).toLowerCase(),
                    agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                    'agent_type#lower': GetNodeProp(agent, NodeProperties.CodeName).toLowerCase()
                })
                result.push(res);
            });
        });

        return result.join('')
    }
    static GenerateStrappers(models) {
        let result = [];

        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(4) + `${modelName.toLowerCase()}Arbiter = ProjectStrapper.Resolve<IRedArbiter<${modelName}>>();` + jNL)
            result.push(Tabs(4) + `${modelName.toLowerCase()}ResponseArbiter = ProjectStrapper.Resolve<IRedArbiter<${modelName}Response>>();` + jNL);

        })

        return result.join('');
    }
    static GenerateStrappersInstances(models) {
        let result = [];

        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(3) + `public IRedArbiter<${modelName}> ${modelName.toLowerCase()}Arbiter;` + jNL)
            result.push(Tabs(3) + `public IRedArbiter<${modelName}Response> ${modelName.toLowerCase()}ResponseArbiter;` + jNL);

        })

        return result.join('');
    }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE, 'utf-8');
        let agent_methods = StreamProcessOrchestrationGenerator.GenerateAgentMethods(state);
        let statics = StreamProcessOrchestrationGenerator.GenerateStaticMethods(models);
        let strappers = StreamProcessOrchestrationGenerator.GenerateStrappers(models);
        let strapperInstances = StreamProcessOrchestrationGenerator.GenerateStrappersInstances(models);
        _streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
            static_methods: statics.join(''),
            agent_type_methods: agent_methods,
            arbiters_strappers: strappers,
            arbiter_instances: strapperInstances
        })
        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        return {
            [StreamProcessOrchestration]: {
                id: StreamProcessOrchestration,
                name: StreamProcessOrchestration,
                template: NamespaceGenerator.Generate({
                    template: _streamProcessTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Constants}`],
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

function Tabs(c) {
    let res = '';
    for (var i = 0; i < c; i++) {
        res += TAB;
    }
    return res;
}