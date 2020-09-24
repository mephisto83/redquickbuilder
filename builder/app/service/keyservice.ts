/* eslint-disable import/prefer-default-export */
import { bindTemplate } from '../constants/functiontypes';
import { GetCodeName, GetModelNodes, GetRootGraph, NodesByType, GetNodeProp } from '../actions/uiactions';
import { NEW_LINE, NodeTypes, NodeProperties, UITypes } from '../constants/nodetypes';
import { GraphKeys } from '../methods/graph_methods';
import { Node } from '../methods/graph_types';
import { ViewTypes } from '../constants/viewtypes';

export function GenerateModelKeys(options: any) {
	const { state, key, language, codeGenerator } = options;
	const models = GetModelNodes();

	const template = `{{name}}: '{{name}}'`;
	const template2 = `{{name}}: '{{value}}'`;

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

	const viewModelKeys = [
		...NodesByType(state, NodeTypes.ComponentApi)
			.filter((x: Node) => GetNodeProp(x, NodeProperties.DefaultComponentApiValue))
			.map((model: Node) =>
				bindTemplate(template, {
					name: GetNodeProp(model, NodeProperties.DefaultComponentApiValue)
				})
			),
		...NodesByType(state, NodeTypes.Screen)
			.filter((model: Node) => {
				switch (GetNodeProp(model, NodeProperties.ViewType)) {
					case ViewTypes.Get:
					case ViewTypes.GetAll:
						return true;
				}
			})
			.map((model: Node) =>
				bindTemplate(template2, {
					name: GetCodeName(model),
					value: GetCodeName(GetNodeProp(model, NodeProperties.Model))
				})
			)
	].unique();
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
			template: codeGenerator
				? `const ModekKeys = { ${templates.join(`,${NEW_LINE}`)}
    }`
				: `export default <{ [index: string]: string }>{ ${templates.join(`,${NEW_LINE}`)}
  }`,
			relative: './src',
			relativeFilePath: `./model_keys${fileEnding}`,
			name: 'model_keys'
		},
		{
			template: codeGenerator
				? `const StateKeys = { ${stateKeyTemplates.join(`,${NEW_LINE}`)}
    }`
				: `export default <{ [index: string]: string }>{ ${stateKeyTemplates.join(`,${NEW_LINE}`)}
  }`,
			relative: './src',
			relativeFilePath: `./state_keys${fileEnding}`,
			name: 'state_keys'
		},
		{
			template: codeGenerator
				? `const ViewModelKeys = { ${viewModelKeys.join(`,${NEW_LINE}`)}
    }`
				: `export const ViewModelKeys = { ${viewModelKeys.join(`,${NEW_LINE}`)}
      }
      `,
			relative: './src',
			relativeFilePath: `./viewmodel_keys${fileEnding}`,
			name: 'viewmodel_keys'
		},
		{
			template: codeGenerator
				? null
				: bindTemplate(
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
