import { GetCodeName, GetNodeTitle, GetNodeProp, NodeProperties, GetConnectedScreenOptions } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { GetScreens } from "./screenservice";
import { NEW_LINE, UITypes } from "../constants/nodetypes";
import { EnableMenu } from "../components/titles";

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
    let add_drawer = `const {{name}} = createDrawerNavigator(
        {
          Home: { screen: _{{name}} }
        },
        {
          contentComponent: _{{name}}.drawerContent,
          navigationOptions: _{{name}}.navigationOptions
        }
      );`
    let importStatements = screens.map(screen => {
        let screenOptions = GetConnectedScreenOptions(screen.id);
        let reactNativeOptions = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative);
        let temp_template = import_template;
        if (GetNodeProp(reactNativeOptions, NodeProperties.EnabledMenu)) {
            temp_template = `import _{{name}} from './screens/{{namejs}}';`
        }
        return bindTemplate(temp_template, {
            name: GetCodeName(screen),
            namejs: GetCodeName(screen).toJavascriptName()
        });
    });

    let combos = screens.map(screen => {
        let screenOptions = GetConnectedScreenOptions(screen.id);
        let reactNativeOptions = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative);
        if (GetNodeProp(reactNativeOptions, NodeProperties.EnabledMenu)) {
            return bindTemplate(add_drawer, {
                name: GetCodeName(screen)
            });
        }
        return false;
    }).filter(x => x);


    let properties = screens.map(screen => {
        return bindTemplate(import_property, {
            name: GetCodeName(screen)
        });
    });

    return bindTemplate(template, {
        imports: importStatements.join(NEW_LINE),
        combos: combos.join(NEW_LINE),
        properties: properties.join(',' + NEW_LINE)
    })
}