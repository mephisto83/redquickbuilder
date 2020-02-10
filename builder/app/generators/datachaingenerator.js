import {
  GenerateChainFunctions,
  GenerateChainFunctionSpecs,
  GetDataChainCollections,
  NodesByType,
  GetJSCodeName
} from "../actions/uiactions";
import { readFileSync } from "fs";
import { UITypes, NEW_LINE, NodeTypes } from "../constants/nodetypes";
import { bindTemplate } from "../constants/functiontypes";

export default class DataChainGenerator {
  static Generate(options) {
    let { language } = options;
    let funcs = GenerateChainFunctions(options);
    let collections = GetDataChainCollections(options);
    let collectionNodes = NodesByType(null, NodeTypes.DataChainCollection);
    let temps = [
      ...collectionNodes.map(nc => {
        let _cfunc = GenerateChainFunctions({ language, collection: nc.id });
        let _colections = GetDataChainCollections({
          language,
          collection: nc.id
        });
        return {
          template: dcTemplate(_colections, _cfunc, "../"),
          relative: "./src/actions/datachains",
          relativeFilePath: `./${GetJSCodeName(nc)}.js`,
          name: `${GetJSCodeName(nc)}`
        };
      }),
      {
        template: dcTemplate(collections, funcs),
        relative: "./src/actions",
        relativeFilePath: `./data-chain.js`,
        name: "data-chain"
      },
      {
        template: readFileSync("./app/utils/observable.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: "./observable.js",
        name: "observable"
      },
      {
        template: readFileSync("./app/utils/redgraph.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: "./redgraph.js",
        name: "redgraph.js"
      },
      //Specific for web sites
      //Need an alternative for ReactNative
      {
        template: readFileSync("./app/utils/redutils.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: "./redutils.js",
        name: "redutils.js"
      }
    ];
    switch (language) {
      case UITypes.ElectronIO:
        let tests = GenerateChainFunctionSpecs(options);
        temps.push({
          relative: "./test",
          relativeFilePath: "./data-chain.spec.js",
          name: "data-chain.spec.js",
          template: bindTemplate(
            readFileSync("./app/templates/electronio/spec.tpl", "utf8"),
            {
              tests: tests.join(NEW_LINE)
            }
          )
        });
        break;
    }
    let result = {};

    temps.map(t => {
      result[t.name] = t;
    });

    return result;
  }
}

let dcTemplate = (collections, funcs, rel = "") => {
  if (!funcs || !funcs.trim()) {
    return `${collections}`;
  }
  return `import { GetC, updateScreenInstanceObject, GetItem, Chain, UIModels, GetDispatch, GetState, UIC, GetItems,UI_MODELS, GetK, updateScreenInstance, clearScreenInstance } from './uiActions';
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
} from './${rel}validation';

import * as navigate from '../${rel}actions/navigationActions';
import * as $service from '../${rel}util/service';
import routes from '../${rel}constants/routes';

import * as RedLists from '../${rel}actions/lists.js';
import * as StateKeys from '../${rel}state_keys';
import * as ModelKeys from '../${rel}model_keys';
import * as ViewModelKeys from '../${rel}viewmodel_keys';
import * as Models from '../${rel}model_keys.js';
import RedObservable from '../${rel}actions/observable.js';
import RedGraph from '../${rel}actions/redgraph.js';
import { useParameters, fetchModel } from '../${rel}actions/redutils.js';
${collections}

${funcs}`;
};
