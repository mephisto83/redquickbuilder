import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodesByType,
  NodeTypes,
  GetRootGraph,
  GetCurrentGraph
} from "../actions/uiactions";
import { Themes, HTMLElementGroups } from "../constants/themes";
import { NEW_LINE, MediaQueries } from "../constants/nodetypes";

function GenerateGlobalCss(options) {
  const { state } = options;
  const graph = GetCurrentGraph(state);
  let result = {};
  let theme = '';
  if (graph) {
    const {
      themeColors = {},
      themeColorUses = {},
      themeOtherUses = {},
      themeGridPlacements = { grids: [] },
      themeFonts = { fonts: [] },
      spaceTheme = {},
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
        themevariables += `${variable}: ${variableValue};${NEW_LINE}`;
      })
    }
    let themecoloruse = '';
    if (themeColorUses) {
      Object.keys(themeColorUses).forEach(colorUse => {
        if (themeColorUses[colorUse])
          themecoloruse += `--${colorUse}: var(--${themeColorUses[colorUse]});${NEW_LINE}`;
      });
    }
    let cssvariables = '';
    if (themeOtherUses) {
      Object.keys(themeOtherUses).forEach(otherUse => {
        if (themeOtherUses[otherUse]) {
          let temp = themeOtherUses[otherUse];
          if (temp.indexOf('--') === 0) {
            temp = `var(${temp})`
          }
          cssvariables += `--${otherUse}: ${temp};${NEW_LINE}`;
        }
      });
    }
    let fontLinks = '';
    let fontCssDef = '';
    if (themeFonts) {
      themeFonts.fonts.forEach(fontInfo => {
        const { font, fontCssVar, fontCss } = fontInfo;
        fontLinks += ` @import url('${font}');${NEW_LINE}`;
        fontCssDef += `${fontCssVar}: ${fontCss};${NEW_LINE}`;
      });
    }
    const spaceThemeRules = {};
    if (spaceTheme) {
      Object.keys(spaceTheme).forEach(space => {
        Object.keys(spaceTheme[space]).forEach(mediaSize => {
          Object.keys(spaceTheme[space][mediaSize]).filter(x => x.indexOf(':') === -1).forEach(key => {
            let val = spaceTheme[space][mediaSize][key];
            if (val) {
              if (val.indexOf('--') === 0) {
                val = `var(${val})`;
              }
              const cssRule = `${key}: ${val};${NEW_LINE}`;
              spaceThemeRules[mediaSize] = spaceThemeRules[mediaSize] || {};
              spaceThemeRules[mediaSize][space] = spaceThemeRules[mediaSize][space] || '';
              spaceThemeRules[mediaSize][space] += cssRule;
            }
          })
        })
      })
    }
    const cssRules = Object.keys(MediaQueries).map(mq => {
      if (spaceThemeRules[mq]) {
        const spaceRules = Object.keys(spaceThemeRules[mq]).map(key => {
          let res;
          if (HTMLElementGroups.some(v => v.type[`${key}`.split(':')[0]])) {
            res = ` ${key.toLowerCase()} {
              ${spaceThemeRules[mq][key]}
            }`;
          }
          else {
            res = ` .${key} {
              ${spaceThemeRules[mq][key]}
            }`;
          }

          return res;
        }).join(NEW_LINE);
        return `
          ${MediaQueries[mq]} {
            ${spaceRules}
          }
        `;
      }
      return '';
    }).filter(x => x).join(NEW_LINE);

    const gridPlacementRules = Object.keys(MediaQueries).map(mq => {
      const gpRules = themeGridPlacements.grids.map(gridSetup => {
        const { gridTemplateColumns = "", gridTemplateRows = "", mediaSizes = {}, gridPlacement, name = "unknown" } = gridSetup;
        if (mediaSizes[mq]) {
          const rowCount = gridTemplateColumns.split(' ').filter(x => x).length;
          const columnCount = gridTemplateRows.split(' ').filter(x => x).length;
          const areas = [].interpolate(0, rowCount, row => {
            const rowArea = [];
            [].interpolate(0, columnCount, col => {
              let area = gridPlacement[row * columnCount + col];
              if (!area) {
                area = '.';
              }
              rowArea.push(area);
            });
            return `"${rowArea.join(' ')}"${NEW_LINE}`;
          });
          return `
        .${name} {
          grid-template-columns: ${gridTemplateColumns};
          grid-template-rows: ${gridTemplateRows};
          grid-template-areas:
${areas.join(NEW_LINE)}
        };
`;
        }
      }).filter(x => x);
      return `
      ${MediaQueries[mq]} {
        ${gpRules}
      }
    `;
    }).join(NEW_LINE);

    const styleLinks = `
      ${fontLinks}
    `;
    const roottag = `* {
      ${fontCssDef}
      ${themecolors}
      ${themevariables}
      ${themecoloruse}
      ${cssvariables}
    }
`;

    theme += styleLinks;
    theme += roottag;
    theme += cssRules;
    theme += gridPlacementRules;
  }
  result = {
    theme,
    userDefined: true,
    relative: "./app/app.global.css"
  };

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

    const result = [res];
    const globalCss = GenerateGlobalCss(options);
    result.push(globalCss);
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
