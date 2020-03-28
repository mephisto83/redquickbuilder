import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodesByType,
  NodeTypes,
  GetRootGraph,
  GetCurrentGraph
} from "../actions/uiactions";
import { Themes } from "../constants/themes";
import { NEW_LINE } from "../constants/nodetypes";

function GenerateGlobalCss(options) {
  const { state } = options;
  const graph = GetCurrentGraph(state);
  const result = {};
  let theme = '';
  if (graph) {
    const {
      themeColors = {},
      themeColorUses = {},
      themeOtherUses = {},
      themeFonts = { fonts: [] },
      themeVariables = { variables: [] }
    } = graph;

    let themecolors = '';
    if (themeColors) {
      Object.keys(themeColors).forEach(v => {
        themecolors += `--${v}: ${themeColors[v]};${NEW_LINE}`;
      });
    }
    let themevariables = '';
    if (themeVariables && themeVariables.variables) {
      themeVariables.variables.forEach(vari => {
        const { variable, variableValue } = vari;
        themevariables += `--${variable}: ${variableValue};${NEW_LINE}`;
      })
    }
    let themecoloruse = '';
    if (themeColorUses) {
      Object.keys(themeColorUses).forEach(colorUse => {
        themecoloruse += `--${colorUse}: --${themeColorUses[colorUse]};${NEW_LINE}`;
      });
    }
    const roottag = `* {
      ${themecolors}
      ${themevariables}
      ${themecoloruse}
    }`;

    theme += roottag;
  }
  result.global = { theme }

  return result;
}
export default class ThemeServiceGenerator {
  static Generate(options) {
    const { state, language } = options;
    const graphRoot = GetRootGraph(state);
    const theme = graphRoot ? graphRoot[GraphMethods.GraphKeys.THEME] : null;
    let res = {};

    if (theme) {
      if (Themes[theme]) {
        if (Themes[theme][language]) {
          res = {
            ...Themes[theme][language]
          }
        }
      }
    }
    GenerateGlobalCss(options);

    const result = [res];
    NodesByType(state, NodeTypes.Theme).sort((a, b) => (GetNodeProp(a, NodeProperties.Priority) || 0) - (GetNodeProp(b, NodeProperties.Priority) || 0)).forEach(node => {
      const themes = GetNodeProp(node, NodeProperties.Themes);
      if (themes) {
        Object.keys(themes).forEach(themme => {
          if (themes[themme]) {
            if (Themes[themme]) {
              if (Themes[themme][language]) {
                res = {
                  ...Themes[themme][language]
                }
                result.push(res);
              }
            }
          }
        });
      }
    })
    return result;
  }
}
