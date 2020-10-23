import fs from "fs";
import {
  GetCodeName,
  GetNodeTitle,
  GetNodeProp,
  NodeProperties,
  GetConnectedScreenOptions,
  GetScreenOptions,
  GetNodeCode,
  GetJSCodeName,
  GetConnectedScreen,
  GetComponentExternalApiNodes,
  GetScreenUrl
} from "../actions/uiactions";
import { bindTemplate } from "../constants/functiontypes";
import { GetScreens, GetScreenOption } from "./screenservice";
import { NEW_LINE, UITypes } from "../constants/nodetypes";
import { EnableMenu } from "../components/titles";
import { fs_readFileSync } from "../generators/modelgenerators";

export function GenerateScreens(options) {
  const temps = BindScreensToTemplate();
  const result = {};

  temps.map(t => {
    result[t.name] = t;
  });

  return result;
}
export function GenerateNavigation(options) {
  const { language } = options;
  const temps = GenerateNavigationRoot();
  const result = {};

  temps.map(t => {
    result[t.name] = t;
  });

  if (language === UITypes.ElectronIO ||
    language === UITypes.ReactWeb) {
    GenerateRoutes(language).map(t => {
      result[t.name] = t;
    });
    GenerateNavigationActions(language).map(t => {
      result[t.name] = t;
    });
  }
  return result;
}

export function GenerateNavigationActions(language) {
  const options = GetScreenOptions().filter(
    x => GetNodeProp(x, NodeProperties.UIType) === language
  );
  const navigationFunctions = options.map(op => {
    const screen = GetConnectedScreen(op.id);
    const template = `
  export function ${GetJSCodeName(screen)}(params = {}) {
    return (dispatch, getState) => {
      dispatch(push(routes.${GetCodeName(screen)}));
    }
  }
  `;
    return template;
  });
  const template = `import { push, replace, go, goBack, goForward } from 'connected-react-router';
import routes from '../constants/routes';
export function GoBack(params = {}) {
  return (dispatch, getState) => {
    dispatch(goBack());
  }
}
export function GoForward(params = {}) {
  return (dispatch, getState) => {
    dispatch(goForward());
  }
}
export function Go(params = {}) {
  return (dispatch, getState) => {
    dispatch(push(params.route));
  };
}
export function Replace(params = {}) {
  return (dispatch, getState) => {
    if(params.route) {
      dispatch(replace(params.route));
    }
    else {
      console.warn('missing route');
    }
  }
}
${navigationFunctions.unique().join(NEW_LINE)}
  `;
  return [
    {
      template,
      relative: "./src",
      relativeFilePath: "actions/navigationActions.js",
      name: "navigationActions.js"
    }
  ];
}

export function GenerateRoutes(language) {
  const options = GetScreens();
  let routes = {};
  let fileEnding = '.js';
  switch (language) {
    case UITypes.ReactWeb:
    case UITypes.ElectronIO:
      fileEnding = '.ts';
      break;
    default: break;
  }
  options.map(op => {
    routes = {
      ...routes,
      [GetCodeName(op)]: (
        ((
          language === UITypes.ElectronIO ||
          language === UITypes.ReactWeb
        ) ? "/" : "") +
        GetNodeProp(op, NodeProperties.HttpRoute)
      )
        .split("//")
        .join("/")
    };
  });
  return [
    {
      template: `export default <{ [index: string]: string }>${JSON.stringify(routes, null, 4)}`,
      relative: "./src",
      relativeFilePath: `constants/routes${fileEnding}`,
      name: "routes.json"
    }
  ];
}
export function GenerateNavigationRoot() {
  const template = BindScreensToTemplate();
  return [
    {
      template,
      relative: "./src",
      relativeFilePath: `./navigationstack.js`,
      name: "navigationstack"
    }
  ];
}
export function BindScreensToTemplate() {
  const screens = GetScreens();
  const template = fs_readFileSync(
    "./app/templates/navigation/navigation.tpl",
    "utf8"
  );
  const import_template = `import {{name}} from './screens/{{namejs}}';`;
  const import_property = `     {{name}} : { screen: {{name}} }`;
  const add_drawer = `const {{name}} = createDrawerNavigator(
        {
          Home: { screen: _{{name}} }
        },
        {
          contentComponent: _{{name}}.drawerContent,
          navigationOptions: _{{name}}.navigationOptions
        }
      );`;
  const importStatements = screens
    .sort((b, a) => (
      (GetNodeProp(a, NodeProperties.Priority) || 0) -
      (GetNodeProp(b, NodeProperties.Priority) || 0)
    ))
    .map(screen => {
      const screenOptions = GetConnectedScreenOptions(screen.id);
      const reactNativeOptions = screenOptions.find(
        x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative
      );
      let temp_template = import_template;
      if (GetNodeProp(reactNativeOptions, NodeProperties.EnabledMenu)) {
        temp_template = `import _{{name}} from './screens/{{namejs}}';`;
      }
      return bindTemplate(temp_template, {
        name: GetCodeName(screen),
        namejs: GetCodeName(screen).toJavascriptName()
      });
    });

  const combos = screens
    .map(screen => {
      const screenOptions = GetConnectedScreenOptions(screen.id);
      const reactNativeOptions = screenOptions.find(
        x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative
      );
      if (GetNodeProp(reactNativeOptions, NodeProperties.EnabledMenu)) {
        return bindTemplate(add_drawer, {
          name: GetCodeName(screen)
        });
      }
      return false;
    })
    .filter(x => x);

  const properties = screens.map(screen => bindTemplate(import_property, {
    name: GetCodeName(screen)
  }));

  return bindTemplate(template, {
    imports: importStatements.join(NEW_LINE),
    combos: combos.join(NEW_LINE),
    properties: properties.join(`,${NEW_LINE}`)
  });
}
