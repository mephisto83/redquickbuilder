import {
  GenerateChainFunctions,
  GenerateChainFunctionSpecs
} from '../actions/uiactions'
import { readFileSync } from 'fs'
import { UITypes, NEW_LINE } from '../constants/nodetypes'
import { bindTemplate } from '../constants/functiontypes'

export default class DataChainGenerator {
  static Generate (options) {
    let { language } = options
    let funcs = GenerateChainFunctions()

    let temps = [
      {
        template: `import { GetItem, Chain, UIModels, GetDispatch, GetState, UIC, GetItems } from './uiActions';
import {
    validateEmail,
    maxLength,
    minLength,
    greaterThanOrEqualTo,
    lessThanOrEqualTo,
    arrayLength,
    numericalDefault,
    equalsLength,
    alphanumericLike,
    alphanumeric,
    alpha
} from './validation';

import * as navigate from './navigationActions';
import * as $service from '../util/service';
import * as routes from '../constants/routes';


import * as StateKeys from '../state_keys';
import * as ViewModelKeys from '../viewmodel_keys';
import * as Models from '../model_keys.js';
import RedObservable from './observable.js';
${funcs}`,
        relative: './src/actions',
        relativeFilePath: `./data-chain.js`,
        name: 'data-chain'
      },
      {
        template: readFileSync('./app/utils/observable.js', 'utf8'),
        relative: './src/actions',
        relativeFilePath: './observable.js',
        name: 'observable'
      }
    ]
    switch (language) {
      case UITypes.ElectronIO:
        let tests = GenerateChainFunctionSpecs(options)
        temps.push({
          relative: './test',
          relativeFilePath: './data-chain.spec.js',
          name: 'data-chain.spec.js',
          template: bindTemplate(
            readFileSync('./app/templates/electronio/spec.tpl', 'utf8'),
            {
              tests: tests.join(NEW_LINE)
            }
          )
        })
        break
    }
    let result = {}

    temps.map(t => {
      result[t.name] = t
    })

    return result
  }
}
