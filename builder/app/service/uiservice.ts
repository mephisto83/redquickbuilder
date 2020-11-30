import { bindTemplate } from "../constants/functiontypes";
import { GetCodeName, GetModelNodes, GetRootGraph } from "../actions/uiActions";
import { NEW_LINE } from "../constants/nodetypes";
import { GraphKeys } from "../methods/graph_methods";
import fs from 'fs';
import { fs_readFileSync } from "../generators/modelgenerators";
export function GenerateUi(options) {
    let { state, key } = options;
    let defaultColors = {
        color1: '#3F51B5',
        color2info: '#3F57D3',
        color3success: '#5cb85c',
        color4: '#d9534f',
        color5warning: '#f0ad4e'
    };
    let alterNate = {
        color1: '#494947',
        color2info: '#35FF69',
        color3success: '#44CCFF',
        color4: '#7494EA',
        color5warning: '#D138BF'
    };
    let colors = GetRootGraph(state)[GraphKeys.COLORSCHEME] || 'e5e1ee-dffdff-90bede-68edc6-90f3ff';
    Object.keys(alterNate).map((t, _i) => {

        alterNate[t] = '#' + (colors.split('-')[_i]);

    })
    let template = fs_readFileSync('./app/templates/themes/react_variables.tpl', 'utf8');

    let templates = [bindTemplate(template, {
        ...defaultColors,
        ...alterNate
    })];

    return [{
        template: templates.join(NEW_LINE),
        relative: './native-base-theme/variables',
        relativeFilePath: `./variables.js`,
        name: 'native_base_theme_variables'
    }];
}