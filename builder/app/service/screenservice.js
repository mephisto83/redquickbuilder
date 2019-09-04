import { GetScreenNodes, GetCodeName, GetNodeTitle, GetConnectedScreenOptions } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";

export function GenerateScreens(options) {
    let temps = BindScreensToTemplate();
    let result = {};

    temps.map(t => {
        result[t.name] = t;
    });

    return result;
}

export function GetScreens() {
    var screens = GetScreenNodes();
    return screens
}

export function BindScreensToTemplate() {
    var screens = GetScreens();
    let template = fs.readFileSync('./app/templates/screens/screen.tpl', 'utf8');

    return screens.map(screen => {
        let screenOptions = GetConnectedScreenOptions(screen.id);
        return {
            template: bindTemplate(template, {
                name: GetCodeName(screen),
                title: `"${GetNodeTitle(screen)}"`
            }),
            relative: './src/screens',
            relativeFilePath: `./${GetCodeName(screen).toJavascriptName()}.js`,
            name: GetCodeName(screen)
        }
    })
}