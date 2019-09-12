import { GetConfigurationNodes, GetNodeProp } from "../actions/uiactions";
import { ConfigurationProperties } from "../constants/nodetypes";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
export default class ConfigurationGenerator {

    static Generate(options) {
        let temp = GetConfigurationNodes(options);
        let res = {};
        temp.map(node => {
            Object.keys(ConfigurationProperties).map(key => {
                res[key] = res[key] || GetNodeProp(node, key);
            });
        });
        let template = fs.readFileSync('./app/templates/components/configuration.tpl', 'utf8');
        template = bindTemplate(template, res);

        let temps = [{
            template,
            relative: './src',
            relativeFilePath: `./configuration.js`,
            name: 'configuration'
        }];

        let result = {};
        temps.map(t => {
            result[t.name] = t;
        });

        return result;
    }
}