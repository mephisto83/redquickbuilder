import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes } from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	STANDARD_CONTROLLER_USING,
	NameSpace,
	STANDARD_TEST_USING
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { fs_readFileSync } from './modelgenerators';

const TEST_CLASS = './app/templates/tests/tests.tpl';
const STREAM_PROCESS_TEMPLATE = './app/templates/stream_process/stream_process.tpl';
const STREAM_PROCESS_TEMPLATE_TESTS = './app/templates/stream_process/tests/stream_process.tpl';
const STREAM_PROCESS_FUNCTION_TEMPLATE = './app/templates/stream_process/stream_process_function.tpl';

export default class StreamProcessGenerator {
	static GenerateStaticMethods(models: any) {
		let agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		let _streamProcessFunctionTemplate = fs_readFileSync(STREAM_PROCESS_FUNCTION_TEMPLATE, 'utf8');
		let staticMethods: any = [];
		agents.map((agent: any) => {
			models.map((model: any) => {
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
	static GenerateStaticMethodTests(models: any[]) {
		let agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		let _streamProcessTemplateTests = fs_readFileSync(STREAM_PROCESS_TEMPLATE_TESTS, 'utf8');
		let _streamProcessFunctionTemplate = _streamProcessTemplateTests;
		let staticMethods: any[] = [];
		agents.map((agent: any) => {
			models.map((model: any) => {
				let streamProcessFunctionTemplate = _streamProcessFunctionTemplate;
				let modelCode = GetNodeProp(model, NodeProperties.CodeName);
				let res: any = bindTemplate(streamProcessFunctionTemplate, {
					model: modelCode,
					agent_type: GetNodeProp(agent, NodeProperties.CodeName),
					[`model#allupper`]: modelCode.toUpperCase()
				});

				staticMethods.push(res + jNL);
			});
		});
		return staticMethods.unique((x: any) => x);
	}
	static Generate(options: any) {
		var { state, key } = options;
		let models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		let _streamProcessTemplate = fs_readFileSync(STREAM_PROCESS_TEMPLATE, 'utf8');
		let _streamProcessTemplateTests = fs_readFileSync(TEST_CLASS, 'utf8');
		let statics = StreamProcessGenerator.GenerateStaticMethods(models);
		let staticTests = StreamProcessGenerator.GenerateStaticMethodTests(models);
		_streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
			static_methods: statics.unique((x: any) => x).join('')
		});

		_streamProcessTemplateTests = bindTemplate(_streamProcessTemplateTests, {
			tests: staticTests.unique((x: any) => x).join(''),
			name: 'StreamProcess'
		});

		return {
			StreamProcess: {
				id: 'StreamProcess',
				name: 'StreamProcess',
				template: NamespaceGenerator.Generate({
					template: _streamProcessTemplate,
					usings: [
						...STANDARD_CONTROLLER_USING,
						'System.Threading',
						`${namespace}${NameSpace.Constants}`,
						`${namespace}${NameSpace.Parameters}`,
						`${namespace}${NameSpace.Model}`
					],
					namespace,
					space: NameSpace.StreamProcess
				})
				// test: NamespaceGenerator.Generate({
				//     template: _streamProcessTemplateTests,
				//     usings: [
				//         ...STANDARD_CONTROLLER_USING,
				//         ...STANDARD_TEST_USING,
				//         'System.Threading',
				//         `${namespace}${NameSpace.Constants}`,
				//         `${namespace}${NameSpace.StreamProcess}`,
				//         `${namespace}${NameSpace.Parameters}`,
				//         `${namespace}${NameSpace.Model}`],
				//     namespace,
				//     space: NameSpace.Tests
				// })
			}
		};
	}
}
const NL = `
`;
const jNL: any = `
`;
const TAB: any = `   `;
