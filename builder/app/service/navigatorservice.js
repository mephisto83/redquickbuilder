import { GetCodeName, GetNodeTitle } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { GetScreens } from "./screenservice";
import { NEW_LINE } from "../constants/nodetypes";

export function GenerateScreens(options) {
    let temps = BindScreensToTemplate();
    let result = {};

    temps.map(t => {
        result[t.name] = t;
    });

    return result;
}
export function GenerateNavigation() {
    let temps = GenerateNavigationRoot();
    let result = {};

    temps.map(t => {
        result[t.name] = t;
    });

    return result;
}
export function GenerateNavigationRoot() {
    let template = BindScreensToTemplate();
    return [{
        template,
        relative: './src',
        relativeFilePath: `./navigationstack.js`,
        name: 'navigationstack'
    }];
}
export function BindScreensToTemplate() {
    var screens = GetScreens();
    let template = fs.readFileSync('./app/templates/navigation/navigation.tpl', 'utf8');
    let import_template = `import {{name}} from './screens/{{namejs}}';`
    let import_property = `     {{name}}: {{name}}`;
    let importStatements = screens.map(screen => {
        return bindTemplate(import_template, {
            name: GetCodeName(screen),
            namejs: GetCodeName(screen).toJavascriptName()
        });
    });
    let properties = screens.map(screen => {
        return bindTemplate(import_property, {
            name: GetCodeName(screen)
        });
    });

    return bindTemplate(template, {
        imports: importStatements.join(NEW_LINE),
        properties: properties.join(',' + NEW_LINE)
    })
}