import { bindTemplate } from "../constants/functiontypes";
import { GetCodeName, GetModelNodes, GetRootGraph } from "../actions/uiactions";
import { NEW_LINE } from "../constants/nodetypes";
import { GraphKeys } from "../methods/graph_methods";
import fs from 'fs';
export function GenerateUi(options) {
    let { state, key } = options;
    let defaultColors = {
        color1: '#3F51B5',
        color2info: '#3F57D3',
        color3success: '#5cb85c',
        color4danger: '#d9534f',
        color5warning: '#f0ad4e'
    };
    let alterNate = {
        color1: '#494947',
        color2info: '#35FF69',
        color3success: '#44CCFF',
        color4danger: '#7494EA',
        color5warning: '#D138BF'
    };
    let colors = '1ac8ed-aed4e6-af7595-8c2155-5c1a1b';
    Object.keys(alterNate).map((t, _i) => {

        alterNate[t] = '#' + (colors.split('-')[_i]);

    })
    let template = fs.readFileSync('./app/templates/themes/react_variables.tpl', 'utf8');

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