import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodesByType,
  NodeTypes,
  GetRootGraph,
  GetNodeTitle,
  GetState
} from "../actions/uiactions";
import {
  LinkType,
  NodePropertyTypesByLanguage,
  ProgrammingLanguages,
  NEW_LINE,
  ConstantsDeclaration,
  MakeConstant,
  NameSpace,
  STANDARD_CONTROLLER_USING,
  ValidationCases,
  STANDARD_TEST_USING,
  Methods,
  ExecutorRules
} from "../constants/nodetypes";
import fs from "fs";
import { bindTemplate } from "../constants/functiontypes";
import { NodeType } from "../components/titles";
import NamespaceGenerator from "./namespacegenerator";
import { enumerate } from "../utils/utils";
import { GenerateServiceInterface } from "../service/customservice";
import { Themes } from "../constants/themes";

const RETURN_GET_CLASS =
  "./app/templates/models/exceptions/exceptions_class.tpl";
const TEST_CLASS = "./app/templates/tests/tests.tpl";

export default class ThemeServiceGenerator {
  static Generate(options) {
    var { state, key ,language} = options;
    let graphRoot = GetRootGraph(state);
    let theme = graphRoot ? graphRoot[GraphMethods.GraphKeys.THEME] : null;
    let result = {};

    if (theme) {
      if (Themes[theme]) {
        if(Themes[theme][language]){
          result = {
            ...Themes[theme][language]
          }
        }
      }
    }

    return result;
  }
}
