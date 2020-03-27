import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodesByType,
  NodeTypes,
  GetRootGraph} from "../actions/uiactions";
import { Themes } from "../constants/themes";


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
