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
  LinkType
} from "../constants/nodetypes";
import fs from "fs";
import * as Titles from "../components/titles";
import {
  bindTemplate,
  MethodTemplateKeys,
  FunctionTemplateKeys,
  HTTP_METHODS
} from "../constants/functiontypes";
import ControllerGenerator from "./controllergenerator";
import { addNewLine } from "../utils/array";
import { GetNodesLinkedTo } from "../methods/graph_methods";
export default class ControllerActionGenerator {
  static GenerateService(options) {
    let { state } = options;
    let temp = NodesByType(state, NodeTypes.Method);
    let serviceTemplate = fs.readFileSync(
      "./app/templates/screens/service.tpl",
      "utf8"
    );
    let methodTemplate = `
{{methodName}}: async (params) => {
    let { parameters } = params;
    return redservice().{{methodType}}(endpoints.{{methodName}});
}`;
    let postMethodTemplate = `
{{methodName}}: async (params) => {
    let { body, parameters } = params;
    return redservice().{{methodType}}(endpoints.{{methodName}}, body, {{options}});
}`;
    let endpoints = {};
    let fetchServices = NodesByType(state, NodeTypes.FetchService);
    let fetchServiceMethodImplementation = false;
    if (fetchServices.length) {
      let fetchService = fetchServices[0];
      endpoints[GetJSCodeName(fetchService)] = `api/fetchservice/${GetNodeProp(fetchService, NodeProperties.HttpRoute)}`;
      fetchServiceMethodImplementation = bindTemplate(postMethodTemplate, {
        methodName: GetJSCodeName(fetchService),
        methodType: `post`,
        options: `{}`
      });
    }
    temp = [
      fetchServiceMethodImplementation,
      ...temp.map(method => {
        let maestroNode = GetMaestroNode(method.id);
        if (maestroNode) {
          let controllerNode = GetControllerNode(maestroNode.id);
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
            let methodType = GetNodeProp(method, NodeProperties.HttpMethod);
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
            let options = [asForm, collectCookies, asText]
              .filter(x => x)
              .join();
            return bindTemplate(
              methodType === HTTP_METHODS.POST
                ? postMethodTemplate
                : methodTemplate,
              {
                methodName: GetJSCodeName(method),
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
      relativeFilePath: `./controllerService.js`,
      name: "controllerService"
    };
  }
  static GenerateFetchService(options) {
    let { state } = options;
    let fetchServices = NodesByType(state, NodeTypes.FetchService);
    if (fetchServices.length) {
      let fetchService = fetchServices[0];
      let datachain = GetNodesLinkedTo(GetCurrentGraph(), {
        id: fetchService.id,
        link: LinkType.DataChainLink
      })[0];
      let service = `
import { setFetchServiceFunction } from './redutils';
import { GetState, GetDispatch } from './uiActions';
import { ${GetCodeName(datachain)} } from './data-chain';
import * as Util from "./util";
export const FETCH_CALL = 'FETCH_CALL';
setFetchServiceFunction(function(package) {
  return Promise.resolve().then(() => {
      let dispatch = GetDispatch();
      let getState = GetState();
      return  (Util.simple(
        service.${GetJSCodeName(fetchService)},
        { body: package },
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
        relativeFilePath: `./fetchService.js`,
        name: "fetchService"
      };
    }
  }
  static Generate(options) {
    let { state } = options;
    let temp = NodesByType(state, NodeTypes.Method);

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
    let controllerActions = temp
      .map(node => {
        let method_call = `return (dispatch, getState) => Util.simple(service.${GetJSCodeName(
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

    let temps = [
      {
        template: bindTemplate(controllerActionTemplate, {
          body: addNewLine(controllerActions, 1)
        }),
        relative: "./src/actions",
        relativeFilePath: `./controllerActions.js`,
        name: "controllerActions"
      },
      ControllerActionGenerator.GenerateService(options),
      ControllerActionGenerator.GenerateFetchService(options)
    ].filter(x => x);

    let result = {};
    temps.map(t => {
      result[t.name] = t;
    });

    return result;
  }
}
