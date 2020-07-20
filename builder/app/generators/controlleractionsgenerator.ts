import fs from 'fs';
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
} from '../actions/uiactions';
import { ConfigurationProperties, NEW_LINE, LinkType, UITypes } from '../constants/nodetypes';
import * as Titles from '../components/titles';
import {
	bindTemplate,
	MethodTemplateKeys,
	FunctionTemplateKeys,
	HTTP_METHODS,
	MethodFunctions
} from '../constants/functiontypes';
import ControllerGenerator from './controllergenerator';
import { addNewLine } from '../utils/array';
import { GetNodesLinkedTo } from '../methods/graph_methods';

export default class ControllerActionGenerator {
	static GenerateService(options: any) {
		const { state, language } = options;
		let fileEnd = '.js';
		let useAny = false;
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				fileEnd = '.ts';
				useAny = true;
				break;
			default:
				break;
		}
		let temp = NodesByType(state, NodeTypes.Method);
		const serviceTemplate = fs.readFileSync('./app/templates/screens/service.tpl', 'utf8');
		const methodTemplate = `
{{methodName}}: async (params${useAny ? ': any' : ''}) => {
    let { template, query } = params;
    {{template_params_def}}
    return redservice().{{methodType}}(\`\${endpoints.{{methodName}}}{{template_params}}\`);
}`;
		const postMethodTemplate = `
{{methodName}}: async (params${useAny ? ': any' : ''}) => {
    let { body, template, query } = params;
    {{template_params_def}}
    return redservice().{{methodType}}(\`\${endpoints.{{methodName}}}{{template_params}}\`, body, {{options}});
}`;
		const endpoints: any = {};
		const fetchServices: any = NodesByType(state, NodeTypes.FetchService);
		let fetchServiceMethodImplementation: any = false;
		if (fetchServices.length) {
			const fetchService = fetchServices[0];
			endpoints[GetJSCodeName(fetchService)] = `api/fetchservice/${GetNodeProp(
				fetchService,
				NodeProperties.HttpRoute
			)}`;
			fetchServiceMethodImplementation = bindTemplate(postMethodTemplate, {
				methodName: GetJSCodeName(fetchService),
				template_params: '',
				template_params_def: '',
				methodType: `post`,
				options: `{}`
			});
		}
		let serviceRequirements: any = [];
		temp = [
			fetchServiceMethodImplementation,
			...temp.map((method: any) => {
				let template_params = '';
				let template_params_def = '';
				const maestroNode = GetMaestroNode(method.id);
				if (maestroNode) {
					const controllerNode = GetControllerNode(maestroNode.id);
					if (controllerNode) {
						let methodName = GetJSCodeName(method);
						if (GetNodeProp(method, NodeProperties.NoApiPrefix)) {
							endpoints[methodName] = `${GetNodeProp(method, NodeProperties.HttpRoute)}`;
						} else {
							endpoints[methodName] = `api/${GetJSCodeName(controllerNode).toLowerCase()}/${GetNodeProp(
								method,
								NodeProperties.HttpRoute
							)}`;
						}
						const methodType = GetNodeProp(method, NodeProperties.HttpMethod);
						const functionType = GetNodeProp(method, NodeProperties.FunctionType);
						let asForm = '';
						let collectCookies = '';
						let asText = '';
						if (GetNodeProp(method, NodeProperties.AsForm)) {
							if (GetNodeProp(method, NodeProperties.CollectCookies)) {
								collectCookies = ' collectCookies: true';
							}

							asForm = ` asForm: true`;
						}
						if (GetNodeProp(method, NodeProperties.AsText)) {
							asText = ` asText: true`;
						}
						let templateKeys: string[] = [];
						const options = [ asForm, collectCookies, asText ].filter((x) => x).join();
						if (
							functionType &&
							MethodFunctions[functionType] &&
							MethodFunctions[functionType].parameters &&
							MethodFunctions[functionType].parameters.parameters &&
							MethodFunctions[functionType].parameters.parameters.template
						) {
							const { modelId, parentId } = MethodFunctions[functionType].parameters.parameters.template;
							templateKeys = Object.keys(MethodFunctions[functionType].parameters.parameters.template);
							let idKey = null;
							if (modelId) {
								template_params = '/${modelId}';
								idKey = 'modelId';
							} else if (parentId) {
								template_params = '/${parentId}';
								idKey = 'parentId';
							} else if (templateKeys && templateKeys.length) {
								template_params = templateKeys.map((t: string) => '/${' + t + '}').join('');
							}

							// THhis need to be flushed out to work with templateKeys.
							// This only handles a single parameter
							if (idKey) {
								serviceRequirements.push(`
              (serviceImpl.${methodName} ${useAny ? 'as any' : ''}).requirements = function(params${useAny
									? ': any'
									: ''}) {
                if(params && params.template && params.template.${idKey} && isGuid(params.template.${idKey})) {
                    return \`${methodType}-$\{params.template.${idKey}}\`;
                }
                return false;
              };
              (serviceImpl.${methodName} ${useAny ? 'as any' : ''}).canSend = function(params${useAny ? ': any' : ''}) {
                if(params && params.template && params.template.${idKey} && isGuid(params.template.${idKey})) {
                    return true;
                }
                return false;
              };
              `);
							}
						}
						if (template_params) {
							template_params_def = 'let { parentId, modelId } = (template || {});';
							if (templateKeys && templateKeys.length) {
								template_params_def = `let { ${templateKeys
									.map((t: string) => t)
									.join(',')} } = (template||{});`;
							}
						}
						return bindTemplate(methodType === HTTP_METHODS.POST ? postMethodTemplate : methodTemplate, {
							methodName: GetJSCodeName(method),
							template_params,
							template_params_def,
							methodType: `${methodType}`.toLowerCase().split('http').join(''),
							options: `{${options} }`
						});
					}
				}
			})
		]
			.filter((x) => x)
			.join(`,${NEW_LINE}`);
		serviceRequirements = serviceRequirements.join(NEW_LINE);
		return {
			template: bindTemplate(serviceTemplate, {
				service_methods: addNewLine(temp, 1),
				endpoints: JSON.stringify(endpoints, null, 4),
				any: useAny ? ': any' : '',
				serviceRequirements
			}),
			relative: './src/util',
			relativeFilePath: `./controllerService${fileEnd}`,
			name: 'controllerService'
		};
	}

	static GenerateFetchService(options: any) {
		const { state, language } = options;
		let fileEnd = '.js';
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				fileEnd = '.ts';
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
import { GetState, GetDispatch } from '../actions/uiactions';
import { ${GetCodeName(datachain)} } from '../actions/data-chain';
import * as Util from "../actions/util";
import service from './controllerService';
export const FETCH_CALL = 'FETCH_CALL';

setFetchServiceFunction(function(body: any) {
  return Promise.resolve().then(() => {
      let dispatch = GetDispatch();
      let getState = GetState();
      return  (Util.simple(
        service.${GetJSCodeName(fetchService)},
        { body },
        {
          loading: FETCH_CALL
        },
        (result: any) => {
          let dataChain = ${GetCodeName(datachain)};
          if (dataChain) {
            return dataChain(result);
          } else {
            console.log("missing data chain");
          }
        }
      ))(dispatch, getState);
  });
});
      `;
			return {
				template: service,
				relative: './src/util',
				relativeFilePath: `./fetchService${fileEnd}`,
				name: 'fetchService'
			};
		}
	}

	static Generate(options: any) {
		const { state, language } = options;
		let fileEnd = '.js';
		let anytypes = '';
		let functiontypes = '';
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				fileEnd = '.ts';
				anytypes = ':any';
				functiontypes = ': Function';
				break;
			default:
				break;
		}
		const temp = NodesByType(state, NodeTypes.Method);

		const ControllerMethodTemplate = `export function {{methodName}}({{arguments}}){
    {{method_call}}
}
        `;
		const controllerActionTemplate = `import Models from '../model_keys';
import StateKeys from '../state_keys';
import service from '../util/controllerService';
import * as Util from './util';
{{body}}
        `;
		const controllerActions = temp
			.map((node: any) => {
				const loadingTypeModel = GetCodeName(
					GetMethodNodeProp(node, FunctionTemplateKeys.ModelOutput) ||
						GetMethodNodeProp(node, FunctionTemplateKeys.Model)
				);
				const method_call = `return (dispatch${functiontypes}, getState${functiontypes}) => Util.simple(service.${GetJSCodeName(
					node
				)}, { ...parameters }, {
    loading: ${loadingTypeModel ? `Models.${loadingTypeModel}` : '"Nothing"'},
    objectType: ${loadingTypeModel ? `Models.${loadingTypeModel}` : '"Nothing"'}
}, (res${anytypes}) => {
    var { dataChain, screenEffects, screenContext } = (parameters || {});
    let result: any = null;
    if (dataChain) {
        result = dataChain(res);
    }

    if(screenEffects && Array.isArray(screenEffects)) {
      screenEffects.forEach((screenEffects${anytypes}) => {
        screenEffects(res, screenContext)
      })
    }

    return result;
}, null, (result${anytypes}) => {
  var { preChain } = (parameters || {});
  if (preChain) {
      return preChain();
  }
})(dispatch, getState);`;
				return bindTemplate(ControllerMethodTemplate, {
					methodName: GetJSCodeName(node),
					method_call: addNewLine(method_call, 1),
					arguments: `parameters${anytypes}`
				});
			})
			.join(NEW_LINE);

		const temps = [
			{
				template: bindTemplate(controllerActionTemplate, {
					body: addNewLine(controllerActions, 1)
				}),
				relative: './src/actions',
				relativeFilePath: `./controllerActions${fileEnd}`,
				name: 'controllerActions'
			},
			ControllerActionGenerator.GenerateService(options),
			ControllerActionGenerator.GenerateFetchService(options)
		].filter((x) => x);

		const result: any = {};
		temps.map((t: any) => {
			result[t.name] = t;
		});

		return result;
	}
}
