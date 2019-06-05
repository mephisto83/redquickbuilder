import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_CHANGE_CLASS_EXTENSION = './app/templates/stream_process/stream_process_response_class_extention.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR = './app/templates/stream_process/stream_process_response_class_extention_constructor.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_FAILED = './app/templates/stream_process/stream_process_response_class_extention_constructor_failed.tpl';

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
        let _streamProcessChangeClassConstructorsFailed = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_FAILED, 'utf-8');

        let result = {};
        agents.map(agent => {
            let constructors = [];
            let properties = '';
            let statics = '';
            let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
            models.map(model2 => {
                models.map(model => {
                    Object.values(Methods).filter(x => x !== Methods.Get && x !== Methods.GetAll).map(method => {

                        let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;
                        let streamProcessChangeClassConstructorsFailed = _streamProcessChangeClassConstructorsFailed;
                        let parameterTemplate = null;
                        if (method === Methods.Delete) {
                            parameterTemplate = `${GetNodeProp(model2, NodeProperties.CodeName)}Change change, bool res`;
                        }
                        else {
                            parameterTemplate = `${GetNodeProp(model2, NodeProperties.CodeName)}Change change, ${GetNodeProp(model, NodeProperties.CodeName)} ${(GetNodeProp(model, NodeProperties.ValueName) || '').toLowerCase()}`;
                        }
                        let parameter_properties = `
            ${method === Methods.Delete ? '' : (`result.IdValue = ${(GetNodeProp(model, NodeProperties.ValueName) || '').toLowerCase()}.Id;`)}
            result.Response = change.Response;
            result.ChangeType = change.ChangeType;
            `
                        streamProcessChangeClassConstructors = bindTemplate(streamProcessChangeClassConstructors, {
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
                            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                            agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
                            change_type: `Methods.${method} `,
                            method,
                            parameters: parameterTemplate,
                            parameters_property: parameter_properties
                        });

                        streamProcessChangeClassConstructorsFailed = bindTemplate(streamProcessChangeClassConstructorsFailed, {
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
                            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                            agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
                            change_type: `Methods.${method} `,
                            method,
                            parameters: parameterTemplate,
                            parameters_property: parameter_properties
                        });
                        if (constructors.indexOf(streamProcessChangeClassConstructors) === -1)
                            constructors.push(streamProcessChangeClassConstructors);

                        if (constructors.indexOf(streamProcessChangeClassConstructorsFailed) === -1)
                            constructors.push(streamProcessChangeClassConstructorsFailed);

                    })
                })
            });

            streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                model: GetNodeProp(agent, NodeProperties.CodeName),
                constructors: constructors.join(jNL),
                properties: ''
            });

            result[GetNodeProp(agent, NodeProperties.CodeName)] = {
                id: GetNodeProp(agent, NodeProperties.CodeName),
                name: `${GetNodeProp(agent, NodeProperties.CodeName)}Response`,
                template: NamespaceGenerator.Generate({
                    template: streamProcessChangeClassExtension,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace} ${NameSpace.Constants} `,
                        `${namespace} ${NameSpace.Model} `],
                    namespace,
                    space: NameSpace.Parameters
                })
            };
        });

        return result;
    }
}
const NL = `
                `
const jNL = `
                `
const TAB = `   `;