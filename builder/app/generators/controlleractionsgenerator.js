import { GetConfigurationNodes, GetNodeProp, NodesByType, NodeTypes, GetJSCodeName, GetCodeName, NodeProperties, GetMaestroNode, GetControllerNode } from "../actions/uiactions";
import { ConfigurationProperties, NEW_LINE } from "../constants/nodetypes";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { addNewLine } from "../service/layoutservice";
import ControllerGenerator from "./controllergenerator";
export default class ControllerActionGenerator {

    static GenerateService(options) {
        let { state } = options;
        let temp = NodesByType(state, NodeTypes.Method);
        let serviceTemplate = fs.readFileSync('./app/templates/screens/service.tpl', 'utf8');
        let methodTemplate = `
{{methodName}}: async () => {
    return redservice().{{methodType}}(endpoints.{{methodName}});
}`;
        let endpoints = {};
        temp = temp.map(method => {
            let maestroNode = GetMaestroNode(method.id);
            if (maestroNode) {
                let controllerNode = GetControllerNode(maestroNode.id);
                if (controllerNode) {
                    endpoints[GetJSCodeName(method)] = `api/${GetJSCodeName(controllerNode)}/${GetNodeProp(method, NodeProperties.HttpRoute)}`

                    return bindTemplate(methodTemplate, {
                        methodName: GetJSCodeName(method),
                        methodType: `${GetNodeProp(method, NodeProperties.HttpMethod)}`.toLowerCase().split('http').join('')
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
        const controllerActionTemplate = `import * as Models from './models';
import { service } from '../service/controllerService';
import * as UIA from './uiActions';
{{body}}
        `;
        let controllerActions = temp.map(node => {
            let method_call = `return (dispatch, getState) => UIA.simple(service.${GetJSCodeName(node)}, {}, {
    loading: Models.${GetCodeName(node)}, 
    objectType: Models.${GetCodeName(node)} 
})(dispatch, getState);`;
            return bindTemplate(ControllerMethodTemplate, {
                methodName: GetJSCodeName(node),
                method_call: addNewLine(method_call, 1),
                arguments: null
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