import { GetConfigurationNodes, GetNodeProp, NodesByType, NodeTypes, GetJSCodeName, GetCodeName, NodeProperties, GetMaestroNode, GetControllerNode, GetMethodNodeProp } from "../actions/uiactions";
import { ConfigurationProperties, NEW_LINE } from "../constants/nodetypes";
import fs from 'fs';
import * as Titles from '../components/titles';
import { bindTemplate, MethodTemplateKeys, FunctionTemplateKeys, HTTP_METHODS } from "../constants/functiontypes";
import { addNewLine } from "../service/layoutservice";
import ControllerGenerator from "./controllergenerator";
export default class ControllerActionGenerator {

    static GenerateService(options) {
        let { state } = options;
        let temp = NodesByType(state, NodeTypes.Method);
        let serviceTemplate = fs.readFileSync('./app/templates/screens/service.tpl', 'utf8');
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
        temp = temp.map(method => {
            let maestroNode = GetMaestroNode(method.id);
            if (maestroNode) {
                let controllerNode = GetControllerNode(maestroNode.id);
                if (controllerNode) {
                    if (GetNodeProp(method, NodeProperties.NoApiPrefix)) {
                        endpoints[GetJSCodeName(method)] = `${GetNodeProp(method, NodeProperties.HttpRoute)}`
                    }
                    else {
                        endpoints[GetJSCodeName(method)] = `api/${GetJSCodeName(controllerNode)}/${GetNodeProp(method, NodeProperties.HttpRoute)}`
                    }
                    let methodType = GetNodeProp(method, NodeProperties.HttpMethod);
                    let asForm = 'null';
                    if (GetNodeProp(method, NodeProperties.AsForm)) {
                        asForm = '{ asForm : true }';
                    }
                    return bindTemplate(methodType === HTTP_METHODS.POST ? postMethodTemplate : methodTemplate, {
                        methodName: GetJSCodeName(method),
                        methodType: `${methodType}`.toLowerCase().split('http').join(''),
                        options: asForm
                    });
                }
            }

        }).filter(x => x).join(',' + NEW_LINE);
        return {
            template: bindTemplate(serviceTemplate, {
                service_methods: addNewLine(temp, 1),
                endpoints: JSON.stringify(endpoints, null, 4)
            }),
            relative: './src/util',
            relativeFilePath: `./controllerService.js`,
            name: 'controllerService'
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
import service from '../util/controllerService';
import * as Util from './util';
{{body}}
        `;
        let controllerActions = temp.map(node => {
            let method_call = `return (dispatch, getState) => Util.simple(service.${GetJSCodeName(node)}, { ...parameters }, {
    loading: Models.${GetCodeName(GetMethodNodeProp(node, FunctionTemplateKeys.ModelOutput)) || Titles.Unknown}, 
    objectType: Models.${GetCodeName(GetMethodNodeProp(node, FunctionTemplateKeys.ModelOutput)) || Titles.Unknown} 
})(dispatch, getState);`;
            return bindTemplate(ControllerMethodTemplate, {
                methodName: GetJSCodeName(node),
                method_call: addNewLine(method_call, 1),
                arguments: 'parameters'
            });
        }).join(NEW_LINE);

        let temps = [{
            template: bindTemplate(controllerActionTemplate, { body: addNewLine(controllerActions, 1) }),
            relative: './src/actions',
            relativeFilePath: `./controllerActions.js`,
            name: 'controllerActions'
        }, ControllerActionGenerator.GenerateService(options)];

        let result = {};
        temps.map(t => {
            result[t.name] = t;
        });

        return result;
    }
}