import { GenerateChainFunctions } from "../actions/uiactions";

export default class DataChainGenerator {

    static Generate(options) {
        let funcs = GenerateChainFunctions();
        let temps = [{
            template: `import { GetItem, Chain } from './uiActions';
import * as Models from '../model_keys.js';
${funcs}`,
            relative: './src/actions',
            relativeFilePath: `./data-chain.js`,
            name: 'data-chain'
        }];

        let result = {};

        temps.map(t => {
            result[t.name] = t;
        });

        return result;
    }
}