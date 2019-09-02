import { bindTemplate } from "../constants/functiontypes";
import { GetCodeName, GetModelNodes, GetRootGraph } from "../actions/uiactions";
import { NEW_LINE } from "../constants/nodetypes";
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

    return [{
        template: templates.join(NEW_LINE),
        relative: './src',
        relativeFilePath: `./model_keys.js`,
        name: 'model_keys'
    }, {
        template: bindTemplate(`{
        "appName": "{{appName}}"
    }`, { appName: GetRootGraph(state)[GraphKeys.PROJECTNAME] }),
        relative: './',
        relativeFilePath: `./app.json`,
        name: 'app_json'
    }];
}