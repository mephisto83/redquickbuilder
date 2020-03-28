/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import TopViewer from "./topviewer";
import { StyleLib } from '../constants/styles';
import { ThemeColors, ContentSectioning, MediaSize, FormThemePropertyKeys, SpaceThemePropertyKeys, HTMLElementGroups, ColorUses, OtherUses } from "../constants/themes";
import { GetCurrentGraph } from "../actions/uiactions";
import TextInput from "./textinput";
import ColorInput from './colorinput';
import { updateGraphProperty } from "../methods/graph_methods";
import Box from "./box";
import FormControl from "./formcontrol";
import * as Titles from './titles';
import SelectInput from "./selectinput";
import { ComponentTags } from "../constants/componenttypes";
import CheckBox from "./checkbox";
import ButtonList from "./buttonlist";
import Typeahead from "./typeahead";

class ThemeView extends Component {
  constructor(props) {
    super(props);
    this.state = { quickColor: '' };
  }

  active() {
    return !!this.props.active;
  }

  getEditBoxes(formType, mediaSize, formTheme, themeColors, config, themeVariables) {
    // ComponentTags
    if (formType && mediaSize) {
      return Object.values(StyleLib.css).map(field => {
        const { placeholder, label, key, type } = field;
        const onChange = value => {
          if (!formTheme[formType]) {
            formTheme[formType] = {};
          }

          if (!formTheme[formType][mediaSize]) {
            formTheme[formType][mediaSize] = {};
          }

          if (!formTheme[formType][mediaSize][key]) {
            formTheme[formType][mediaSize][key] = {};
          }


          formTheme[formType][mediaSize][key] = value;

          Object.keys(config).forEach(ms => {
            if (!formTheme[formType][ms]) {
              formTheme[formType][ms] = {};
            }
            if (this.state.bindAll) {
              formTheme[formType][ms][key] = value;

            }
            else {
              formTheme[formType][ms][key] = formTheme[formType][ms][key] || value;
            }
          })

          this.props.updateGraph('spaceTheme', formTheme)

        };
        const fieldValue = formTheme[formType] && formTheme[formType][mediaSize] ?
          formTheme[formType][mediaSize][key] : null;


        if (type === 'color') {
          return (<SelectInput
            key={`field-color-${key}`}
            value={fieldValue}
            label={label}
            title={label}
            color={themeColors ? themeColors[fieldValue] : null}
            onChange={onChange}
            options={Object.keys(ThemeColors).map(d => ({ title: d, value: d }))} />)
        }
        const use = key;
        const variableNameParts = label.split('-').map(v => v.toLowerCase());
        if (!variableNameParts.some(v => use.toLowerCase().indexOf(v) === -1)) {
          return (<Typeahead
            key={`field-font-family-${use}`}
            value={fieldValue}
            label={use}
            title={use}
            onChange={onChange}
            options={themeVariables.variables
              .filter(t => !variableNameParts.some(v => t.variable.toLowerCase().indexOf(v) === -1))
              .map(d => ({
                title: d.variable,
                value: d.variable
              }))} />)

        }
        return (
          <TextInput key={`field-${key}`} value={fieldValue}
            label={label}
            title={label}
            onChange={onChange}
            placeholder={placeholder}
          />);

      })
    }
    return [];
  }

  getSpaceFields(formType, mediaSize, formTheme, themeColors = {}) {
    // ComponentTags
    if (formType && mediaSize) {
      return Object.values(StyleLib.css).map(field => {
        const { placeholder, label, key, type } = field;
        const onChange = value => {
          if (!formTheme[formType]) {
            formTheme[formType] = {};
          }

          if (!formTheme[formType][mediaSize]) {
            formTheme[formType][mediaSize] = {};
          }

          if (!formTheme[formType][mediaSize][key]) {
            formTheme[formType][mediaSize][key] = {};
          }


          formTheme[formType][mediaSize][key] = value;

          Object.keys(MediaSize).forEach(ms => {
            if (!formTheme[formType][ms]) {
              formTheme[formType][ms] = {};
            }
            formTheme[formType][ms][key] = formTheme[formType][ms][key] || value;
          })

          this.props.updateGraph('spaceTheme', formTheme)

        };
        const fieldValue = formTheme[formType] && formTheme[formType][mediaSize] ?
          formTheme[formType][mediaSize][key] : null;
        if (type === 'color') {
          return (<SelectInput
            key={`field-color-${key}`}
            value={fieldValue}
            label={label}
            title={label}
            color={themeColors ? themeColors[fieldValue] : null}
            onChange={onChange}
            options={Object.keys(ThemeColors).map(d => ({ title: d, value: d }))} />)
        }
        return (
          <TextInput key={`field-${key}`} value={fieldValue}
            label={label}
            title={label}
            onChange={onChange}
            placeholder={placeholder}
          />);

      })
    }
    return [];
  }

  getFormFields(formType, mediaSize, formTheme, themeColors = {}) {
    if (formType && mediaSize) {
      return [{
        placeholder: Titles.FontFamily,
        label: Titles.FontFamily,
        key: FormThemePropertyKeys.FontFamily
      }, {
        placeholder: Titles.FontSource,
        label: Titles.FontSource,
        key: FormThemePropertyKeys.FontSource
      }, {
        placeholder: Titles.FontSize,
        label: Titles.FontSize,
        key: FormThemePropertyKeys.FontSize
      }, {
        placeholder: Titles.FontStyle,
        label: Titles.FontStyle,
        key: FormThemePropertyKeys.FontStyle
      }, {
        placeholder: Titles.FontVariant,
        label: Titles.FontVariant,
        key: FormThemePropertyKeys.FontVariant
      }, {
        placeholder: Titles.FontWeight,
        label: Titles.FontWeight,
        key: FormThemePropertyKeys.FontWeight
      }, {
        placeholder: Titles.Color,
        label: Titles.Color,
        key: FormThemePropertyKeys.Color,
        type: 'color'
      },].map(field => {
        const { placeholder, label, key, type } = field;
        const onChange = value => {
          if (!formTheme[formType]) {
            formTheme[formType] = {};
          }

          if (!formTheme[formType][mediaSize]) {
            formTheme[formType][mediaSize] = {};
          }

          if (!formTheme[formType][mediaSize][key]) {
            formTheme[formType][mediaSize][key] = {};
          }


          formTheme[formType][mediaSize][key] = value;

          Object.keys(MediaSize).forEach(ms => {
            if (!formTheme[formType][ms]) {
              formTheme[formType][ms] = {};
            }
            formTheme[formType][ms][key] = formTheme[formType][ms][key] || value;
          })

          this.props.updateGraph('formTheme', formTheme)

        };
        const fieldValue = formTheme[formType] && formTheme[formType][mediaSize] ?
          formTheme[formType][mediaSize][key] : null;
        if (type === 'color') {
          return (<SelectInput
            key={`field-color-${key}`}
            value={fieldValue}
            label={label}
            title={label}
            color={themeColors ? themeColors[fieldValue] : null}
            onChange={onChange}
            options={Object.keys(ThemeColors).map(d => ({ title: d, value: d }))} />)
        }
        return (
          <TextInput key={`field-${key}`} value={fieldValue}
            label={label}
            title={label}
            onChange={onChange}
            placeholder={placeholder}
          />);

      })
    }
    return [];
  }

  render() {
    const active = this.active();
    const graph = GetCurrentGraph();
    if (!graph) {
      return <div />;
    }
    const { formTheme = {}, spaceTheme = {} } = graph;
    const {
      themeColors = {},
      themeColorUses = {},
      themeOtherUses = {},
      themeFonts = { fonts: [] },
      themeVariables = { variables: [] }
    } = graph;

    const colors = Object.keys(ThemeColors).map(color => {
      if (themeColors) {
        return [(<ColorInput
          value={themeColors[color]}
          immediate
          label={`${color} : ${themeColors[color]}`}
          key={`color-${color}`}
          onChange={value => {
            this.props.updateGraph('themeColors', { ...themeColors, [color]: value });
            const quickColor = [ThemeColors.primary,
            ThemeColors.secondary,
            ThemeColors.tertiary,
            ThemeColors.quanternary,
            ThemeColors.quinary].map(v => {
              if (!themeColors[v]) {
                return `000000`;
              }
              return themeColors[v].split('#').join('');
            }).join('-');
            this.setState({ quickColor })
          }}
          placeholder={color}
        />)]
      }
      return null;
    }).filter(x => x);

    const colorUses = Object.keys(ColorUses).map(use => {
      if (themeColors) {
        return (<SelectInput
          key={`field-color-${use}`}
          value={themeColorUses ? themeColorUses[use] : null}
          label={use}
          title={use}
          color={themeColors && themeColorUses ? themeColors[themeColorUses[use]] : null}
          onChange={value => {
            this.props.updateGraph('themeColorUses', { ...themeColorUses, [use]: value });
          }}
          options={Object.keys(ThemeColors).map(d => ({ title: d, value: d }))} />)
      }
      return null;
    }).filter(x => x);

    const otherUses = Object.keys(OtherUses).map(use => {
      if (themeOtherUses) {
        let variableNameParts = ['font', 'size'];
        if (!variableNameParts.some(v => use.toLowerCase().indexOf(v) === -1)) {
          return (<Typeahead
            key={`field-font-family-${use}`}
            value={themeOtherUses ? themeOtherUses[use] : null}
            label={use}
            title={use}
            onChange={value => {
              this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
            }}
            options={themeVariables.variables
              .filter(t => !variableNameParts.some(v => t.variable.toLowerCase().indexOf(v) === -1))
              .map(d => ({
                title: d.variable,
                value: d.variable
              }))} />)

        }
        if (use.indexOf('FontFamily') !== -1) {
          return (<SelectInput
            key={`field-font-family-${use}`}
            value={themeOtherUses ? themeOtherUses[use] : null}
            label={use}
            title={use}
            onChange={value => {
              this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
            }}
            options={themeFonts.fonts.map(d => ({ title: d.fontCssVar, value: d.fontCssVar }))} />)
        }
        return (<TextInput
          key={`field-color-${use}`}
          value={themeOtherUses ? themeOtherUses[use] : null}
          label={use}
          title={use}
          color={themeOtherUses ? themeOtherUses[use] : null}
          onChange={value => {
            this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
          }} />)
      }
      return null;
    }).filter(x => x);

    return (
      <TopViewer active={active} >
        <section className="content">
          <div className="row">
            <div className="col-md-2">
              <Box maxheight={600} title={Titles.Style}>
                <FormControl>
                  <SelectInput
                    options={Object.keys(MediaSize).map(v => ({ title: v, value: v, id: v }))}
                    label={Titles.MediaSizes}
                    onChange={(value) => {
                      this.setState({ mediaSize: value })
                    }}
                    value={this.state.mediaSize} />
                  <CheckBox
                    label={Titles.BindAll}
                    onChange={(value) => {
                      this.setState({ bindAll: value })
                    }}
                    value={this.state.bindAll} />
                  <TextInput value={this.state.quickColor}
                    immediate
                    label={Titles.QuickColor}
                    onChange={value => {
                      if (value) {
                        const pcolors = value.split('-');
                        if (pcolors && pcolors.length === 5) {
                          if (!pcolors.some(v => v.split('').some(y => `0123456789abcdef`.indexOf(y) === -1))) {
                            const newTheme = { ...themeColors };
                            [ThemeColors.primary,
                            ThemeColors.secondary,
                            ThemeColors.tertiary,
                            ThemeColors.quanternary,
                            ThemeColors.quinary].forEach((col, index) => {
                              if (pcolors[index]) {
                                newTheme[col] = `#${pcolors[index]}`;
                              }
                            })
                            this.props.updateGraph('themeColors', newTheme)
                          }
                        }

                      }
                      this.setState({ quickColor: value })
                    }}
                    placeholder="######-######-######-######-######"
                  />
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.Fonts}>
                <FormControl>
                  <TextInput
                    value={this.state.font}
                    label={Titles.Font}
                    title={Titles.Font}
                    immediate
                    onChange={(value) => {
                      this.setState({ font: value })
                    }} />
                  <TextInput
                    value={this.state.fontCss}
                    label={Titles.FontCss}
                    title={Titles.FontCss}
                    immediate
                    onChange={(value) => {
                      this.setState({ fontCss: value })
                    }}
                  />
                  <TextInput
                    value={this.state.fontCssVar}
                    label={Titles.FontCssVar}
                    immediate
                    title={Titles.FontCssVar}
                    onChange={(value) => {
                      if (value && value.indexOf('--') === -1) {
                        value = `--${value}`;
                      }
                      this.setState({ fontCssVar: value })
                    }}
                  />
                  {this.state.font && this.state.fontCss && this.state.fontCssVar ? <button onClick={() => {
                    if (this.state.font && this.state.fontCss && this.state.fontCssVar) {
                      themeFonts.fonts = [{
                        font: this.state.font,
                        fontCss: this.state.fontCss,
                        fontCssVar: this.state.fontCssVar
                      }, ...themeFonts.fonts].unique(v => v.font);
                      this.props.updateGraph('themeFonts', { ...themeFonts });
                      this.setState({ font: '' })
                    }
                  }} >Ok</button> : null}
                  <ButtonList
                    active
                    items={themeFonts.fonts.map(v => ({ title: v.font, id: v.font, ...v }))}
                    renderItem={(item) => {
                      return (<div>
                        <h4 style={{ margin: 0 }}>{item.font}</h4>
                        <h5 style={{ margin: 0 }}>{item.fontCss}</h5>
                        <h6 style={{ margin: 0 }}>{item.fontCssVar}</h6>
                      </div>)
                    }}
                    onClick={item => {
                      themeFonts.fonts = themeFonts.fonts.filter(x => x.font !== item.id);
                      this.props.updateGraph('themeFonts', { ...themeFonts })
                    }}
                  />
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2">
              <Box maxheight={500} title="Variables">
                <FormControl>
                  <TextInput
                    value={this.state.variable}
                    label={Titles.Variable}
                    title={Titles.Variable}
                    immediate
                    onChange={(value) => {
                      if (value && value.indexOf('--') === -1) {
                        value = `--${value}`;
                      }
                      this.setState({ variable: value })
                    }} />
                  <TextInput
                    value={this.state.variableValue}
                    label={Titles.Value}
                    title={Titles.Value}
                    immediate
                    onChange={(value) => {
                      this.setState({ variableValue: value })
                    }}
                  />
                  {this.state.variable && this.state.variableValue ? <button onClick={() => {
                    if (this.state.variable && this.state.variableValue) {
                      themeVariables.variables = [{
                        variable: this.state.variable,
                        variableValue: this.state.variableValue
                      }, ...themeVariables.variables].unique(v => v.variable);
                      this.props.updateGraph('themeVariables', { ...themeVariables });
                    }
                  }} >Ok</button> : null}
                  <ButtonList
                    active
                    items={themeVariables.variables.map(v => ({ title: v.variable, id: v.variable, ...v }))}
                    renderItem={(item) => (<div>
                      <h4 style={{ margin: 0 }}>{item.variable}</h4>
                      <h6 style={{ margin: 0 }}>{item.variableValue}</h6>
                    </div>)}
                    onClick={item => {
                      themeVariables.variables = themeVariables.variables.filter(x => x.variable !== item.id);
                      this.props.updateGraph('themeVariables', { ...themeVariables })
                    }}
                  />
                </FormControl>

              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.Style}>
                <FormControl>
                  {colors}
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.ColorUse}>
                <FormControl>
                  {colorUses}
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.OtherUses}>
                <FormControl>
                  {otherUses}
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.SpaceTheme}>
                <FormControl>
                  <SelectInput
                    options={Object.keys(ComponentTags).map(v => ({ title: v, value: v, id: v }))}
                    label={Titles.Parents}
                    onChange={(value) => {
                      this.setState({ componentTag: value })
                    }}
                    value={this.state.componentTag} />
                  <SelectInput
                    options={Object.keys(MediaSize).map(v => ({ title: v, value: v, id: v }))}
                    label={Titles.Parents}
                    onChange={(value) => {
                      this.setState({ mediaSize: value })
                    }}
                    value={this.state.mediaSize} />

                  {this.getSpaceFields(this.state.componentTag, this.state.mediaSize, spaceTheme, themeColors)}
                </FormControl>
              </Box>
            </div>
            {HTMLElementGroups ? HTMLElementGroups.map(group => (
              <div className="col-md-2" >
                <Box maxheight={500} title={group.name}>
                  <FormControl>
                    <SelectInput
                      options={Object.keys(group.type).map(v => ({ title: v, value: v, id: v }))}
                      label={Titles.Parents}
                      onChange={(value) => {
                        this.setState({ [group.name]: value })
                      }}
                      value={this.state[group.name]} />
                    {this.getEditBoxes(this.state[group.name], this.state.mediaSize, spaceTheme, graph[group.name], group, themeVariables)}
                  </FormControl>
                </Box>
              </div>
            )) : null}
            <div className="col-md-4" />
          </div>
        </section>
      </TopViewer>
    );
  }

}

export default UIConnect(ThemeView);
