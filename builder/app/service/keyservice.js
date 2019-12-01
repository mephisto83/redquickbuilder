import { bindTemplate } from "../constants/functiontypes";
import { GetCodeName, GetModelNodes, GetRootGraph, NodesByType, GetNodeProp } from "../actions/uiactions";
import { NEW_LINE, NodeTypes, NodeProperties } from "../constants/nodetypes";
import { GraphKeys } from "../methods/graph_methods";

export function GenerateModelKeys(options) {
    let { state, key } = options;
    let models = GetModelNodes();

    let template = `export const {{name}} = '{{name}}';`

    let templates = models.map(model => {
        return bindTemplate(template, {
            name: GetCodeName(model)
        });
    });

    let viewModelKeys = NodesByType(state, NodeTypes.ComponentApi)
        .filter(x => GetNodeProp(x, NodeProperties.DefaultComponentApiValue))
        .map(model => {
            return bindTemplate(template, {
                name: GetNodeProp(model, NodeProperties.DefaultComponentApiValue)
            });
        }).unique();
    let stateKeys = NodesByType(state, NodeTypes.StateKey);
    let stateKeyTemplates = stateKeys.map(model => {
        return bindTemplate(template, {
            name: GetCodeName(model)
        });
    });

    return [{
        template: templates.join(NEW_LINE),
        relative: './src',
        relativeFilePath: `./model_keys.js`,
        name: 'model_keys'
    }, {
        template: stateKeyTemplates.join(NEW_LINE),
        relative: './src',
        relativeFilePath: `./state_keys.js`,
        name: 'state_keys'
    },{
        template: viewModelKeys.join(NEW_LINE),
        relative: './src',
        relativeFilePath: `./viewmodel_keys.js`,
        name: 'viewmodel_keys'
    }, {
        template: bindTemplate(`{
        "appName": "{{appName}}"
    }`, { appName: GetRootGraph(state)[GraphKeys.PROJECTNAME] }),
        relative: './',
        relativeFilePath: `./app.json`,
        name: 'app_json'
    }];
}