import {
  GenerateChainFunctions,
  GenerateChainFunctionSpecs,
  GetDataChainCollections,
  NodesByType,
  GetJSCodeName,
  GetNodeProp,
  GetCurrentGraph,
  GetRelativeDataChainPath
} from "../actions/uiactions";
import { readFileSync } from "fs";
import {
  UITypes,
  NEW_LINE,
  NodeTypes,
  LinkType,
  NodeProperties
} from "../constants/nodetypes";
import { bindTemplate } from "../constants/functiontypes";
import {
  GetNodeLinkedTo,
  TARGET,
  GetNodesLinkedTo
} from "../methods/graph_methods";

export default class DataChainGenerator {
  static GenerateCS(options) {
    let { state, language } = options;
    let result = {};

    let _cfunc = GenerateChainFunctions({
      cs: true,
      language
    });

    return result;
  }
  static Generate(options) {
    let { state, language } = options;
    let fileEnding = ".js";
    switch (language) {
      case UITypes.ElectronIO:
        fileEnding = ".ts";
        break;
    }
    let graph = GetCurrentGraph(state);
    let funcs = GenerateChainFunctions(options);
    let collections = GetDataChainCollections(options);
    let collectionNodes = NodesByType(null, NodeTypes.DataChainCollection);
    let temps = [
      ...collectionNodes.map(nc => {
        let isInLanguage = CollectionIsInLanguage(graph, nc.id, language);
        let _cfunc = isInLanguage
          ? GenerateChainFunctions({ language, collection: nc.id })
          : null;
        let _colections = isInLanguage
          ? GetDataChainCollections({
              language,
              collection: nc.id
            })
          : null;
        if (!isInLanguage) {
          return false;
        }
        let chainPath = GetRelativeDataChainPath(nc);
        return {
          template: dcTemplate(
            _colections,
            _cfunc,
            []
              .interpolate(0, chainPath.length + 1)
              .map(d => "../")
              .join("")
          ),
          relative: `./src/actions/datachains/${chainPath.join("/")}${
            chainPath.length ? "/" : ""
          }`,
          relativeFilePath: `./${GetJSCodeName(nc)}${fileEnding}`,
          name: `${chainPath.join("_")}${GetJSCodeName(nc)}`
        };
      }),
      {
        template: dcTemplate(collections, funcs),
        relative: "./src/actions",
        relativeFilePath: `./data-chain${fileEnding}`,
        name: "data-chain"
      },
      {
        template: readFileSync("./app/utils/observable.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: `./observable${fileEnding}`,
        name: "observable"
      },
      {
        template: readFileSync("./app/utils/redgraph.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: `./redgraph${fileEnding}`,
        name: "redgraph.js"
      },
      //Specific for web sites
      //Need an alternative for ReactNative
      {
        template: readFileSync("./app/utils/redutils.js", "utf8"),
        relative: "./src/actions",
        relativeFilePath: `./redutils${fileEnding}`,
        name: "redutils.js"
      }
    ].filter(x => x);
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
  return `import {
    GetC,
    updateScreenInstanceObject,
    GetItem,
    Chain,
    UIModels, GetDispatch,
    GetState, UIC,
    GetItems,UI_MODELS,
    GetK, updateScreenInstance,
    clearScreenInstance

  } from '../${rel}actions/uiActions';
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

import * as RedLists from '../${rel}actions/lists';
import * as StateKeys from '../${rel}state_keys';
import * as ModelKeys from '../${rel}model_keys';
import * as ViewModelKeys from '../${rel}viewmodel_keys';
import * as Models from '../${rel}model_keys';
import RedObservable from '../${rel}actions/observable';
import RedGraph from '../${rel}actions/redgraph';
import { useParameters, fetchModel } from '../${rel}actions/redutils';
${collections}

${funcs}`;
};

export function CollectionIsInLanguage(graph, collection, language) {
  let reference = GetNodeLinkedTo(graph, {
    id: collection,
    link: LinkType.DataChainCollectionReference
  });
  if (reference) {
    if (GetNodeProp(reference, NodeProperties.NODEType) === NodeTypes.Screen) {
      return true;
    } else if (GetNodeProp(reference, NodeProperties.UIType) === language) {
      return true;
    } else if (GetNodeProp(reference, NodeProperties.UIType)) {
      return false;
    } else {
      let parent = GetNodesLinkedTo(graph, {
        id: collection,
        link: LinkType.DataChainCollection,
        direction: TARGET
      }).filter(
        x =>
          GetNodeProp(x, NodeProperties.NODEType) ===
          NodeTypes.DataChainCollection
      )[0];
      if (parent) {
        return CollectionIsInLanguage(graph, parent.id, language);
      }
    }
  } else {
    return true;
  }

  return false;
}
