/* eslint-disable import/prefer-default-export */
import { bindTemplate } from '../constants/functiontypes';
import { GetCodeName, GetModelNodes, GetRootGraph, NodesByType, GetNodeProp } from '../actions/uiactions';
import { NEW_LINE, NodeTypes, NodeProperties, UITypes } from '../constants/nodetypes';
import { GraphKeys } from '../methods/graph_methods';
import { Node } from '../methods/graph_types';

export function GenerateModelKeys(options) {
	const { state, key, language } = options;
	const models = GetModelNodes();

	const template = `{{name}}: '{{name}}'`;

	const templates = models.map((model: Node) =>
		bindTemplate(template, {
			name: GetCodeName(model)
		})
	);
	let fileEnding;
	switch (language) {
		case UITypes.ReactWeb:
		case UITypes.ElectronIO:
			fileEnding = '.ts';
			break;
		default:
			fileEnding = '.js';
			break;
	}

	const viewModelKeys = NodesByType(state, NodeTypes.ComponentApi)
		.filter((x) => GetNodeProp(x, NodeProperties.DefaultComponentApiValue))
		.map((model: Node) =>
			bindTemplate(template, {
				name: GetNodeProp(model, NodeProperties.DefaultComponentApiValue)
			})
		)
		.unique();
	const stateKeys = NodesByType(state, NodeTypes.StateKey);
	const stateKeyTemplates = stateKeys
		.map((model: Node) =>
			bindTemplate(template, {
				name: GetCodeName(model)
			})
		)
		.unique();

	return [
		{
			template: `export default <{ [index: string]: string }>{ ${templates.join(`,${NEW_LINE}`)}
  }`,
			relative: './src',
			relativeFilePath: `./model_keys${fileEnding}`,
			name: 'model_keys'
		},
		{
			template: `export default <{ [index: string]: string }>{ ${stateKeyTemplates.join(`,${NEW_LINE}`)}
  }`,
			relative: './src',
			relativeFilePath: `./state_keys${fileEnding}`,
			name: 'state_keys'
		},
		{
			template: `export default <{ [index: string]: string }>{ ${viewModelKeys.join(`,${NEW_LINE}`)}
  }`,
			relative: './src',
			relativeFilePath: `./viewmodel_keys${fileEnding}`,
			name: 'viewmodel_keys'
		},
		{
			template: bindTemplate(
				`{
        "appName": "{{appName}}"
    }`,
				{ appName: GetRootGraph(state)[GraphKeys.PROJECTNAME] }
			),
			relative: './',
			relativeFilePath: `./app.json`,
			name: 'app_json'
		}
	];
}
