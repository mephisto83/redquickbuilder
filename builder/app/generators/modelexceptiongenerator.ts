import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph, GetNodeTitle } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const RETURN_GET_CLASS = './app/templates/models/exceptions/exceptions_class.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelReturnGenerator {

  static Generate(options) {
    var { state, key } = options;
    let graphRoot = GetRootGraph(state);
    let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
    let graph = GetRootGraph(state);
    let result = {};

    let _return_get_class = fs.readFileSync(RETURN_GET_CLASS, 'utf8');
    let allfilters = NodesByType(state, NodeTypes.ModelFilter);
    let allmodels = NodesByType(state, NodeTypes.Model)
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController));
    let allagents = allmodels.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
    allagents.map(agent => {

      let templateRes = bindTemplate(_return_get_class, {
        agent: GetNodeProp(agent, NodeProperties.CodeName)
      });
      result[GetNodeProp(agent, NodeProperties.CodeName)] = {
        id: GetNodeProp(agent, NodeProperties.CodeName),
        name: `${GetNodeProp(agent, NodeProperties.CodeName)}Exceptions`,
        template: NamespaceGenerator.Generate({
          template: templateRes,
          usings: [
            ...STANDARD_CONTROLLER_USING,
            `${namespace}${NameSpace.Model}`,
            `${namespace}${NameSpace.Interface}`,
            `${namespace}${NameSpace.Constants}`],
          namespace,
          space: NameSpace.Controllers
        })
      };
    })

    return result;
  }
}
