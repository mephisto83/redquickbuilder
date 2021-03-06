import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiActions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	Methods,
	STANDARD_CONTROLLER_USING,
	STANDARD_TEST_USING
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { fs_readFileSync } from './modelgenerators';

const STREAM_PROCESS_CHANGE_CLASS_EXTENSION =
	'./app/templates/stream_process/stream_process_response_class_extention.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR =
	'./app/templates/stream_process/stream_process_response_class_extention_constructor.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TEST =
	'./app/templates/stream_process/tests/stream_process_response_class_extention_constructor.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_FAILED =
	'./app/templates/stream_process/stream_process_response_class_extention_constructor_failed.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const PROPERTY_TABS = 6;
export default class ChangeResponseGenerator {
	static Tabs(c: number) {
		let res = '';
		for (var i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
	static Generate(options: { state: any; key: any; language?: any }) {
		var { state, key } = options;
		let models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController));
		let agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let _streamProcessChangeClassExtension = fs_readFileSync(STREAM_PROCESS_CHANGE_CLASS_EXTENSION, 'utf8');
		let _streamProcessChangeClassConstructors = fs_readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR, 'utf8');
		let _streamProcessChangeClassConstructorsTest = fs_readFileSync(
			STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TEST,
			'utf8'
		);
		let _streamProcessChangeClassConstructorsFailed = fs_readFileSync(
			STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_FAILED,
			'utf8'
		);
		let _test: any = fs_readFileSync(TEST_CLASS, 'utf8');
		let result: any = {};
		agents.map((agent: any) => {
			let constructors: string[] = [];
			let tests: string[] = [];
			let properties = '';
			let statics = '';
			let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
			let test = _test;
			models.map((model2: any) => {
				models.map((model: any) => {
					Object.values(Methods).filter((x) => x !== Methods.Get && x !== Methods.GetAll).map((method) => {
						let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;
						let streamProcessChangeClassConstructorsFailed = _streamProcessChangeClassConstructorsFailed;
						let streamProcessChangeClassConstructorsTest = _streamProcessChangeClassConstructorsTest;
						let parameterTemplate = null;
						let arrange = '';
						let changeParameterName = `${GetNodeProp(model2, NodeProperties.CodeName)}ChangeBy${GetNodeProp(
							agent,
							NodeProperties.CodeName
						)}`;
						if (method === Methods.Delete) {
							parameterTemplate = `${changeParameterName} change, bool res`;
							arrange = `
            var change = ${changeParameterName}.Create();
            var res = true;
                            `;
						} else {
							parameterTemplate = `${changeParameterName} change, ${GetNodeProp(
								model,
								NodeProperties.CodeName
							)} ${(GetNodeProp(model, NodeProperties.ValueName) || '').toLowerCase()}`;
							arrange = `
            var change = ${changeParameterName}.Create();
            var res =  ${GetNodeProp(model, NodeProperties.CodeName)}.Create();
            change.Response = "response";
            change.ChangeType = "changeType";
                            `;
						}
						let parameter_properties = `
            ${method === Methods.Delete
				? ''
				: `
            result.IdValue = ${(GetNodeProp(model, NodeProperties.ValueName) || '').toLowerCase()}.Id;`}
            result.Response = change.Response;
            result.ChangeType = change.ChangeType;
            `;
						let act = `
            var response = ${GetNodeProp(agent, NodeProperties.CodeName)}Response.${method}(change, res);
`;
						let assert = `
            Assert.AreEqual(response.Response, change.Response);
            Assert.AreEqual(response.ChangeType, change.ChangeType);
`;
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

						streamProcessChangeClassConstructorsTest = bindTemplate(
							streamProcessChangeClassConstructorsTest,
							{
								model: GetNodeProp(model, NodeProperties.CodeName),
								model2: GetNodeProp(model2, NodeProperties.CodeName),
								value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
								agent_type: GetNodeProp(agent, NodeProperties.CodeName),
								agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
								change_type: `Methods.${method} `,
								method,
								assert,
								act,
								arrange,
								parameters: parameterTemplate,
								parameters_property: parameter_properties
							}
						);

						streamProcessChangeClassConstructorsFailed = bindTemplate(
							streamProcessChangeClassConstructorsFailed,
							{
								model: GetNodeProp(model, NodeProperties.CodeName),
								value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
								agent_type: GetNodeProp(agent, NodeProperties.CodeName),
								agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
								change_type: `Methods.${method} `,
								method,
								parameters: parameterTemplate,
								parameters_property: parameter_properties
							}
						);
						if (!tests.some((x) => x === streamProcessChangeClassConstructorsTest)) {
							tests.push(streamProcessChangeClassConstructorsTest);
						}
						if (constructors.indexOf(streamProcessChangeClassConstructors) === -1)
							constructors.push(streamProcessChangeClassConstructors);

						if (constructors.indexOf(streamProcessChangeClassConstructorsFailed) === -1)
							constructors.push(streamProcessChangeClassConstructorsFailed);
					});
				});
			});

			streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
				model: GetNodeProp(agent, NodeProperties.CodeName),
				constructors: constructors.join(jNL),
				properties: ''
			});
			test = bindTemplate(test, {
				model: GetNodeProp(agent, NodeProperties.CodeName),
				constructors: constructors.join(jNL),
				name: `${GetNodeProp(agent, NodeProperties.CodeName)}Response`,
				properties: '',
				tests: tests.join(jNL)
			});

			result[GetNodeProp(agent, NodeProperties.CodeName)] = {
				id: GetNodeProp(agent, NodeProperties.CodeName),
				name: `${GetNodeProp(agent, NodeProperties.CodeName)}Response`,
				tname: `${GetNodeProp(agent, NodeProperties.CodeName)}ResponseTests`,
				template: NamespaceGenerator.Generate({
					template: streamProcessChangeClassExtension,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace} ${NameSpace.Constants} `,
						`${namespace} ${NameSpace.Model} `
					],
					namespace,
					space: NameSpace.Parameters
				}),
				test: NamespaceGenerator.Generate({
					template: test,
					usings: [
						...STANDARD_CONTROLLER_USING,
						...STANDARD_TEST_USING,
						`${namespace} ${NameSpace.Parameters} `,
						`${namespace} ${NameSpace.Constants} `,
						`${namespace} ${NameSpace.Model} `
					],
					namespace,
					space: NameSpace.Parameters
				})
			};
		});

		return result;
	}
}
const NL = `
                `;
const jNL = `
                `;
const TAB = `   `;
