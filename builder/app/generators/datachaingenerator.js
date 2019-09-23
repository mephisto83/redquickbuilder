import { GenerateChainFunctions } from "../actions/uiactions";
import { readFileSync } from "fs";

export default class DataChainGenerator {

    static Generate(options) {
        let funcs = GenerateChainFunctions();
        let temps = [{
            template: `import { GetItem, Chain } from './uiActions';
import * as Models from '../model_keys.js';
import RedObservable from './observable.js';
${funcs}`,
            relative: './src/actions',
            relativeFilePath: `./data-chain.js`,
            name: 'data-chain'
        }, {
            template: readFileSync('./app/utils/observable.js', 'utf8'),
            relative: './src/actions',
            relativeFilePath: './observable.js',
            name: 'observable'
        }];

        let result = {};

        temps.map(t => {
            result[t.name] = t;
        });

        return result;
    }
}