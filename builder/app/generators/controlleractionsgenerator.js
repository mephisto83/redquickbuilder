import {
  GetConfigurationNodes,
  GetNodeProp,
  NodesByType,
  NodeTypes,
  GetJSCodeName,
  GetCodeName,
  NodeProperties,
  GetMaestroNode,
  GetControllerNode,
  GetMethodNodeProp,
  GetCurrentGraph
} from "../actions/uiactions";
import {
  ConfigurationProperties,
  NEW_LINE,
  LinkType,
  UITypes
} from "../constants/nodetypes";
import fs from "fs";
import * as Titles from "../components/titles";
import {
  bindTemplate,
  MethodTemplateKeys,
  FunctionTemplateKeys,
  HTTP_METHODS,
  MethodFunctions
} from "../constants/functiontypes";
import ControllerGenerator from "./controllergenerator";
import { addNewLine } from "../utils/array";
import { GetNodesLinkedTo } from "../methods/graph_methods";
export default class ControllerActionGenerator {
  static GenerateService(options) {
    const { state, language } = options;
    let fileEnd = ".js";
    switch (language) {
      case UITypes.ElectronIO:
        fileEnd = ".ts";
        break;
    }
    let temp = NodesByType(state, NodeTypes.Method);
    const serviceTemplate = fs.readFileSync(
      "./app/templates/screens/service.tpl",
      "utf8"
    );
    const methodTemplate = `
{{methodName}}: async (params) => {
    let { template, query } = params;
    {{template_params_def}}
    return redservice().{{methodType}}(\`\${endpoints.{{methodName}}}{{template_params}}\`);
}`;
    const postMethodTemplate = `
{{methodName}}: async (params) => {
    let { body, template, query } = params;
    {{template_params_def}}
    return redservice().{{methodType}}(\`\${endpoints.{{methodName}}}{{template_params}}\`, body, {{options}});
}`;
    const endpoints = {};
    const fetchServices = NodesByType(state, NodeTypes.FetchService);
    let fetchServiceMethodImplementation = false;
    if (fetchServices.length) {
      const fetchService = fetchServices[0];
      endpoints[GetJSCodeName(fetchService)] = `api/fetchservice/${GetNodeProp(
        fetchService,
        NodeProperties.HttpRoute
      )}`;
      fetchServiceMethodImplementation = bindTemplate(postMethodTemplate, {
        methodName: GetJSCodeName(fetchService),
        template_params: "",
        template_params_def: "",
        methodType: `post`,
        options: `{}`
      });
    }
    temp = [
      fetchServiceMethodImplementation,
      ...temp.map(method => {
        let template_params = "";
        let template_params_def = "";
        const maestroNode = GetMaestroNode(method.id);
        if (maestroNode) {
          const controllerNode = GetControllerNode(maestroNode.id);
          if (controllerNode) {
            if (GetNodeProp(method, NodeProperties.NoApiPrefix)) {
              endpoints[GetJSCodeName(method)] = `${GetNodeProp(
                method,
                NodeProperties.HttpRoute
              )}`;
            } else {
              endpoints[GetJSCodeName(method)] = `api/${GetJSCodeName(
                controllerNode
              ).toLowerCase()}/${GetNodeProp(
                method,
                NodeProperties.HttpRoute
              )}`;
            }
            const methodType = GetNodeProp(method, NodeProperties.HttpMethod);
            const functionType = GetNodeProp(method, NodeProperties.FunctionType);
            let asForm = "";
            let collectCookies = "";
            let asText = "";
            if (GetNodeProp(method, NodeProperties.AsForm)) {
              if (GetNodeProp(method, NodeProperties.CollectCookies)) {
                collectCookies = " collectCookies: true";
              }

              asForm = ` asForm: true`;
            }
            if (GetNodeProp(method, NodeProperties.AsText)) {
              asText = ` asText: true`;
            }
            const options = [asForm, collectCookies, asText]
              .filter(x => x)
              .join();
            if (
              functionType &&
              MethodFunctions[functionType] &&
              MethodFunctions[functionType].parameters &&
              MethodFunctions[functionType].parameters.parameters &&
              MethodFunctions[functionType].parameters.parameters.template
            ) {
              const { modelId, parentId } = MethodFunctions[
                functionType
              ].parameters.parameters.template;
              if (modelId) {
                template_params = "/${modelId}";
              } else if (parentId) {
                template_params = "/${parentId}";
              }
            }
            if (template_params) {
              template_params_def =
                "let { parentId, modelId } = (template || {});";
            }
            return bindTemplate(
              methodType === HTTP_METHODS.POST
                ? postMethodTemplate
                : methodTemplate,
              {
                methodName: GetJSCodeName(method),
                template_params,
                template_params_def,
                methodType: `${methodType}`
                  .toLowerCase()
                  .split("http")
                  .join(""),
                options: `{${options} }`
              }
            );
          }
        }
      })
    ]
      .filter(x => x)
      .join("," + NEW_LINE);
    return {
      template: bindTemplate(serviceTemplate, {
        service_methods: addNewLine(temp, 1),
        endpoints: JSON.stringify(endpoints, null, 4)
      }),
      relative: "./src/util",
      relativeFilePath: `./controllerService${fileEnd}`,
      name: "controllerService"
    };
  }

  static GenerateFetchService(options) {
    const { state, language } = options;
    let fileEnd = ".js";
    switch (language) {
      case UITypes.ElectronIO:
        fileEnd = ".ts";
        break;
    }
    const fetchServices = NodesByType(state, NodeTypes.FetchService);
    if (fetchServices.length) {
      const fetchService = fetchServices[0];
      const datachain = GetNodesLinkedTo(GetCurrentGraph(), {
        id: fetchService.id,
        link: LinkType.DataChainLink
      })[0];
      const service = `
import { setFetchServiceFunction } from '../actions/redutils';
import { GetState, GetDispatch } from '../actions/uiActions';
import { ${GetCodeName(datachain)} } from '../actions/data-chain';
import * as Util from "../actions/util";
import service from './controllerService';
export const FETCH_CALL = 'FETCH_CALL';

setFetchServiceFunction(function(body) {
  return Promise.resolve().then(() => {
      let dispatch = GetDispatch();
      let getState = GetState();
      return  (Util.simple(
        service.${GetJSCodeName(fetchService)},
        { body },
        {
          loading: FETCH_CALL
        },
        result => {
          let dataChain = ${GetCodeName(datachain)};
          if (dataChain) {
            return dataChain(result);
          } else {
            console.low("missing data chain");
          }
        }
      ))(dispatch, getState);
  });
});
      `;
      return {
        template: service,
        relative: "./src/util",
        relativeFilePath: `./fetchService${fileEnd}`,
        name: "fetchService"
      };
    }
  }

  static Generate(options) {
    const { state, language } = options;
    let fileEnd = ".js";
    switch (language) {
      case UITypes.ElectronIO:
        fileEnd = ".ts";
        break;
    }
    const temp = NodesByType(state, NodeTypes.Method);

    const ControllerMethodTemplate = `export function {{methodName}}({{arguments}}){
    {{method_call}}
}
        `;
    const controllerActionTemplate = `import * as Models from '../model_keys';
import * as StateKeys from '../state_keys';
import * as ModelKeys from '../model_keys';
import service from '../util/controllerService';
import * as Util from './util';
{{body}}
        `;
    const controllerActions = temp
      .map(node => {
        const method_call = `return (dispatch, getState) => Util.simple(service.${GetJSCodeName(
          node
        )}, { ...parameters }, {
    loading: Models.${GetCodeName(
      GetMethodNodeProp(node, FunctionTemplateKeys.ModelOutput)
    ) || Titles.Unknown},
    objectType: Models.${GetCodeName(
      GetMethodNodeProp(node, FunctionTemplateKeys.ModelOutput)
    ) || Titles.Unknown}
}, (result) => {
    var { dataChain } = (parameters || {});
    if (dataChain) {
        return dataChain(result);
    }
    else {
        console.low('missing data chain');
    }
})(dispatch, getState);`;
        return bindTemplate(ControllerMethodTemplate, {
          methodName: GetJSCodeName(node),
          method_call: addNewLine(method_call, 1),
          arguments: "parameters"
        });
      })
      .join(NEW_LINE);

    const temps = [
      {
        template: bindTemplate(controllerActionTemplate, {
          body: addNewLine(controllerActions, 1)
        }),
        relative: "./src/actions",
        relativeFilePath: `./controllerActions${fileEnd}`,
        name: "controllerActions"
      },
      ControllerActionGenerator.GenerateService(options),
      ControllerActionGenerator.GenerateFetchService(options)
    ].filter(x => x);

    const result = {};
    temps.map(t => {
      result[t.name] = t;
    });

    return result;
  }
}
