import { GetConfigurationNodes, GetNodeProp, NodeProperties } from '../actions/uiActions';
import { ConfigurationProperties } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { fs_readFileSync } from './modelgenerators';
export default class ConfigurationGenerator {
	static Generate(options: any) {
		let temp = GetConfigurationNodes();
		let res: any = {};
		temp.map((node: any) => {
			res.https = res.https || (GetNodeProp(node, NodeProperties.UseHttps) ? 'https' : 'http');
			Object.keys(ConfigurationProperties).map((key) => {
				res[key] = res[key] || GetNodeProp(node, key);
			});
		});
		let template = fs_readFileSync('./app/templates/components/configuration.tpl', 'utf8');
		template = bindTemplate(template, res);

		let temps = [
			{
				template,
				relative: './src',
				relativeFilePath: `./configuration.js`,
				name: 'configuration'
			}
		];

		let result: any = {};
		temps.map((t) => {
			result[t.name] = t;
		});

		return result;
	}
}
