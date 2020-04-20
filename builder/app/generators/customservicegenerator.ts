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

const RETURN_GET_CLASS =
  "./app/templates/models/exceptions/exceptions_class.tpl";
const TEST_CLASS = "./app/templates/tests/tests.tpl";

export default class CustomServiceGenerator {
  static Generate(options) {
    var { state, key } = options;
    let graphRoot = GetRootGraph(state);
    let namespace = graphRoot
      ? graphRoot[GraphMethods.GraphKeys.NAMESPACE]
      : null;
    let serviceInterfaces = NodesByType(GetState(), NodeTypes.ServiceInterface);
    let result = {};
    serviceInterfaces.map(serviceInterface => {
      let _interface = GenerateServiceInterface(serviceInterface);
      result[GetNodeProp(serviceInterface, NodeProperties.CodeName)] = {
        id: GetNodeProp(serviceInterface, NodeProperties.CodeName),
        iname: `I${GetNodeProp(serviceInterface, NodeProperties.CodeName)}`,
        interface: NamespaceGenerator.Generate({
          template: _interface,
          usings: [
            ...STANDARD_CONTROLLER_USING,
            `${namespace}${NameSpace.Model}`,
            `${namespace}${NameSpace.Interface}`,
            `${namespace}${NameSpace.Parameters}`,
            `${namespace}${NameSpace.Constants}`
          ],
          namespace,
          space: NameSpace.Controllers
        })
      };
    });

    return result;
  }
}
