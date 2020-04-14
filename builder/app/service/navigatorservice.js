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
import fs from "fs";
import { bindTemplate } from "../constants/functiontypes";
import { GetScreens, GetScreenOption } from "./screenservice";
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
export function GenerateNavigation(options) {
  let { language } = options;
  let temps = GenerateNavigationRoot();
  let result = {};

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
  let options = GetScreenOptions().filter(
    x => GetNodeProp(x, NodeProperties.UIType) === language
  );
  let navigationFunctions = options.map(op => {
    let screen = GetConnectedScreen(op.id);
    let template = `
  export function ${GetJSCodeName(screen)}(params = {}) {
    return (dispatch, getState) => {
      dispatch(push(routes.${GetCodeName(screen)}));
    }
  }
  `;
    return template;
  });
  let template = `import { push, replace, go, goBack, goForward } from 'connected-react-router';
import * as routes from '../constants/routes';
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
  let options = GetScreens();
  let routes = {};
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
      template: JSON.stringify(routes, null, 4),
      relative: "./src",
      relativeFilePath: "constants/routes.json",
      name: "routes.json"
    }
  ];
}
export function GenerateNavigationRoot() {
  let template = BindScreensToTemplate();
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
  var screens = GetScreens();
  let template = fs.readFileSync(
    "./app/templates/navigation/navigation.tpl",
    "utf8"
  );
  let import_template = `import {{name}} from './screens/{{namejs}}';`;
  let import_property = `     {{name}} : { screen: {{name}} }`;
  let add_drawer = `const {{name}} = createDrawerNavigator(
        {
          Home: { screen: _{{name}} }
        },
        {
          contentComponent: _{{name}}.drawerContent,
          navigationOptions: _{{name}}.navigationOptions
        }
      );`;
  let importStatements = screens
    .sort((b, a) => {
      return (
        (GetNodeProp(a, NodeProperties.Priority) || 0) -
        (GetNodeProp(b, NodeProperties.Priority) || 0)
      );
    })
    .map(screen => {
      let screenOptions = GetConnectedScreenOptions(screen.id);
      let reactNativeOptions = screenOptions.find(
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

  let combos = screens
    .map(screen => {
      let screenOptions = GetConnectedScreenOptions(screen.id);
      let reactNativeOptions = screenOptions.find(
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

  let properties = screens.map(screen => {
    return bindTemplate(import_property, {
      name: GetCodeName(screen)
    });
  });

  return bindTemplate(template, {
    imports: importStatements.join(NEW_LINE),
    combos: combos.join(NEW_LINE),
    properties: properties.join("," + NEW_LINE)
  });
}
