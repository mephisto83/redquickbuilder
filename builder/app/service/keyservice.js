import { bindTemplate } from "../constants/functiontypes";
import { GetCodeName, GetModelNodes } from "../actions/uiactions";
import { NEW_LINE } from "../constants/nodetypes";

export function GenerateModelKeys() {
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
    }];
}