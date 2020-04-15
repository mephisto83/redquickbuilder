import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodesByType,
  NodeTypes,
  GetRootGraph,
  GetCurrentGraph,
  GetAppSettings
} from "../actions/uiactions";
import { Themes, HTMLElementGroups } from "../constants/themes";
import { NEW_LINE, MediaQueries, UITypes } from "../constants/nodetypes";

function GenerateGlobalCss(options) {
  const { state, language } = options;
  const graph = GetCurrentGraph(state);
  let result = {};
  let theme = '';
  let fontStyleLink = '';
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
        const { font, fontCssVar, fontCss, fontName } = fontInfo;
        fontLinks += ` @import url('${font}');${NEW_LINE}`;
        fontStyleLink += `<link href="${font}" rel="stylesheet">${NEW_LINE}`;
        fontLinks += `@font-face {
          font-family: "${fontName}";
          src: url(${font});
        }${NEW_LINE}`
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


    const gridPlacementRules = Object.keys(MediaQueries).map(mq => {
      const selectors = [];
      const htmlselector = []
      themeGridPlacements.grids.map(gridSetup => {
        const { name } = gridSetup;
        if (name) {
          selectors.push(name)
        }
      });

      if (spaceThemeRules[mq]) {
        Object.keys((spaceThemeRules[mq] || {})).forEach(key => {
          if (HTMLElementGroups.some(v => v.type[`${key}`.split(':')[0]])) {
            selectors.push(key.toLowerCase());
            htmlselector.push(key.toLowerCase());
          }
          else {
            selectors.push(key);
          }

        })
      }
      const allrules = selectors.map(selector => {
        let selectorRule = '';
        if (spaceThemeRules[mq]) {
          selectorRule += Object.keys(spaceThemeRules[mq]).map(key => {
            let res = false;

            if (HTMLElementGroups.some(v => v.type[`${key}`.split(':')[0]])) {
              if (selector === key.toLowerCase()) {
                res = `
              ${spaceThemeRules[mq][key]}
            `;
              }
            }
            else if (selector === key) {
              res = `
              ${spaceThemeRules[mq][key]}
            `;
            }

            return res;
          }).filter(x => x).join(NEW_LINE);
        }
        selectorRule += themeGridPlacements.grids.map(gridSetup => {
          const { gridTemplateColumns = "", gridTemplateColumnGap = '', gridTemplateRowGap = '', gridTemplateRows = "", mediaSizes = {}, gridPlacement, name = "unknown" } = gridSetup;
          if (selector === name) {
            if (mediaSizes[mq]) {
              const columnCount = gridTemplateColumns.split(' - ').join('-').split(' ').filter(x => x).length;
              const rowCount = gridTemplateRows.split(' - ').join('-').split(' ').filter(x => x).length;
              const areas = [].interpolate(0, rowCount, row => {
                const rowArea = [];
                [].interpolate(0, columnCount, col => {
                  let area = gridPlacement[row * columnCount + col];
                  if (!area || !area.trim()) {
                    area = '.';
                  }
                  rowArea.push(area);
                });
                return `"${rowArea.join(' ')}"${NEW_LINE}`;
              });
              let gap = '';
              if (gridTemplateRowGap) {
                let rowGap = gridTemplateRowGap;
                if (gridTemplateRowGap.indexOf('--') === 0) {
                  rowGap = `var(${rowGap})`;
                }
                gap += `grid-row-gap: ${rowGap};
                `
              }
              if (gridTemplateColumnGap) {
                let colGap = gridTemplateColumnGap;
                if (gridTemplateColumnGap.indexOf('--') === 0) {
                  colGap = `var(${colGap})`;
                }
                gap += `grid-column-gap: ${colGap};
                `
              }
              return `
          display: grid;
          grid-template-columns: ${gridTemplateColumns};
          grid-template-rows: ${gridTemplateRows};
          ${gap}
          grid-template-areas:
${areas.join(NEW_LINE)};
`;
            }
          }
        }).filter(x => x).join(NEW_LINE);
        if (selectorRule) {
          if (htmlselector.indexOf(selector) !== -1) {
            return `${selector} {
              ${selectorRule}
            }`;
          }
          return `.${selector} {
            ${selectorRule}
          }`;
        }
      }).filter(x => x).join(NEW_LINE);

      return `
      ${MediaQueries[mq]} {
        ${allrules}
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
    theme += gridPlacementRules;
  }
  const appSettings = GetAppSettings(graph);
  if (appSettings) {
    fontStyleLink += `
    <script src="https://kit.fontawesome.com/84589ad5a6.js" crossorigin="anonymous"></script>
  `;
  }
  let srcpath = '';
  switch (language) {
    case UITypes.ElectronIO:
      srcpath = 'app';
      break;
    case UITypes.ReactWeb:
      srcpath = 'src';
      break;
    default: break;
  }

  result = {
    theme,
    userDefined: true,
    relative: `./${srcpath}/app.global.css`,
    styleLink: fontStyleLink
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
