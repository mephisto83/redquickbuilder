import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	Methods,
	STANDARD_CONTROLLER_USING
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { fs_readFileSync } from './modelgenerators';

const CONSTANTS_CLASS = './app/templates/constants.tpl';
const CONSTANTS_JS_CLASS = './app/templates/constants_js.tpl';

export default class ConstantsGenerator {
	static Tabs(c: number) {
		let res = '';
		for (var i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
	static Generate(options: { values: any; state: any; key?: any }) {
		var { values = [], state } = options;
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let _constantsClass = fs_readFileSync(CONSTANTS_CLASS, 'utf8');
		let result: any = {};
		values.map((value: { model: any; name: any }) => {
			let { model, name } = value;
			let constantsClass = _constantsClass;
			let constructors = [];
			var consts = Object.keys(model)
				.map((key) => {
					let template = `public const string {{name}} = "{{value}}";`;
					let temp = bindTemplate(template, {
						name: key,
						value: model[key]
					});
					return ConstantsGenerator.Tabs(3) + temp;
				})
				.join(jNL);

			constantsClass = bindTemplate(constantsClass, {
				constants: consts,
				constants_type: name
			});

			result[name] = {
				id: name,
				name: name,
				template: NamespaceGenerator.Generate({
					template: constantsClass,
					usings: [ ...STANDARD_CONTROLLER_USING ],
					namespace,
					space: NameSpace.Constants
				})
			};
		});

		return result;
	}

	static GenerateTs(options: { values?: any; state: any; key?: any }) {
		var { values = [], state } = options;
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let _constantsClass = fs_readFileSync(CONSTANTS_JS_CLASS, 'utf8');
		let result: any = {};
		values.map((value: { model: any; name: any }) => {
			let { model, name } = value;
			let constantsClass = _constantsClass;
			var consts = Object.keys(model)
				.map((key) => {
					let template = `{{name}} = "{{value}}"`;
					let temp = bindTemplate(template, {
						name: key,
						value: model[key]
					});
					return ConstantsGenerator.Tabs(3) + temp;
				})
				.join(`,${jNL}`);

			constantsClass = bindTemplate(constantsClass, {
				constants: consts,
				constants_type: name
			});

			result[`./${name}.ts`] = {
				id: name,
				name: name,
				relative: './src/constants',
				relativeFilePath: `./${name.toJavascriptName()}.ts`,
				template: constantsClass
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
