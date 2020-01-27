import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodeTypes,
  NodesByType,
  GetRootGraph,
  GetCodeName,
  GetMethodProps,
  GetCurrentGraph,
  GetMethodsProperty,
  GetControllerNode
} from "../actions/uiactions";
import {
  LinkType,
  NodePropertyTypesByLanguage,
  ProgrammingLanguages,
  NameSpace,
  STANDARD_CONTROLLER_USING,
  Methods,
  NEW_LINE
} from "../constants/nodetypes";
import fs from "fs";
import {
  bindTemplate,
  FunctionTypes,
  Functions,
  TEMPLATE_KEY_MODIFIERS,
  FunctionTemplateKeys,
  ToInterface,
  MethodFunctions
} from "../constants/functiontypes";
import NamespaceGenerator from "./namespacegenerator";

const CONTROLLER_CLASS_FETCH_FUNCTION =
  "./app/templates/controller/fetch_service_function.tpl";
const CONTROLLER_CLASS_FETCH_FUNCTION_Get_PROPERTY =
  "./app/templates/controller/fetch_service_set_property.tpl";
const CONTROLLER_CLASS_TEMPLATE = "./app/templates/controller/controller.tpl";

const PROPERTY_TABS = 6;
export default class FetchServiceGenerator {
  static Tabs(c) {
    let res = "";
    for (var i = 0; i < c; i++) {
      res += TAB;
    }
    return res;
  }
  static Generate(options) {
    var { state, key } = options;
    let graphRoot = GetRootGraph(state);
    let namespace = graphRoot
      ? graphRoot[GraphMethods.GraphKeys.NAMESPACE]
      : null;
    let result = {};
    let controller = NodesByType(state, NodeTypes.FetchService)[0];
    let controllerUser = "controllerUser";
    let controllerTemplateClass = fs.readFileSync(
      CONTROLLER_CLASS_TEMPLATE,
      "utf-8"
    );
    let fetchServiceFunction = fs.readFileSync(
      CONTROLLER_CLASS_FETCH_FUNCTION,
      "utf-8"
    );
    let fetchServiceFunctionGetProperty = fs.readFileSync(
      CONTROLLER_CLASS_FETCH_FUNCTION_Get_PROPERTY,
      "utf-8"
    );
    let userNode = NodesByType(state, NodeTypes.Model).find(x =>
      GetNodeProp(x, NodeProperties.IsUser)
    );
    let outputType = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
      id: controller.id,
      link: LinkType.FetchServiceOuput
    })[0];

    let methods = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
      id: controller.id,
      link: LinkType.FetchService
    }).filter(x => {
      let methodType = GetNodeProp(x, NodeProperties.FunctionType);
      return FunctionTypes[methodType].isFetchCompatible;
    });

    let functions = "";
    let set_outputs = "";
    set_outputs = methods
      .map(method => {
        let methodProperties = GetNodeProp(
          maestro_function,
          NodeProperties.MethodProps
        );
        let modelNode = GraphMethods.GetNode(root, methodProperties.model);
        let maestro = GetMaestroNode(method.id);
        let controller = GetControllerNode(GetMaestroNode.id);
        let output_type = GetNodeProp(modelNode, NodeProperties.CodeName);
        return bindTemplate(fetchServiceFunctionGetProperty, {
          model_output: GetCodeName(output_type),
          functionName: GetCodeName(method),
          controller: GetCodeName(controller),
          controller_user: controllerUser
        });
      })
      .join(NEW_LINE);
    let httpMethod = `${GetNodeProp(controller, NodeProperties.HttpMethod)}`;
    let httpRoute = `${GetNodeProp(controller, NodeProperties.HttpRoute)}`;
    let codeName = `${GetNodeProp(controller, NodeProperties.CodeName)}`;

    functions = bindTemplate(fetchServiceFunction, {
      output_type: GetCodeName(outputType),
      functionName: "FetchItems",
      http_route: httpRoute || "{controller_generator_http_method}",
      http_method: "HttpPost",
      set_outputs
    });
    controllerTemplateClass = bindTemplate(controllerTemplateClass, {
      codeName: codeName,
      "codeName#alllower": codeName.toLowerCase(),
      user_instance: controllerUser,

      user: userNode
        ? GetNodeProp(userNode, NodeProperties.CodeName)
        : "{controller_generator_code_name}",
      functions
    });
    result[GetNodeProp(controller, NodeProperties.CodeName)] = {
      id: GetNodeProp(controller, NodeProperties.CodeName),
      name: GetNodeProp(controller, NodeProperties.CodeName),
      template: NamespaceGenerator.Generate({
        template: controllerTemplateClass,
        usings: [
          ...STANDARD_CONTROLLER_USING,
          `${namespace}${NameSpace.Model}`,
          "Microsoft.AspNetCore.Mvc"
        ],
        namespace,
        space: NameSpace.Controllers
      })
    };

    return result;
  }
}
const NL = `
                    `;
const jNL = `
`;
const TAB = `   `;
