/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import TopViewer from "./topviewer";
import { ThemeColors, FormTypes, MediaSize, FormThemePropertyKeys, SpaceThemePropertyKeys } from "../constants/themes";
import { GetCurrentGraph } from "../actions/uiactions";
import TextInput from "./textinput";
import ColorInput from './colorinput';
import { updateGraphProperty } from "../methods/graph_methods";
import Box from "./box";
import FormControl from "./formcontrol";
import * as Titles from './titles';
import SelectInput from "./selectinput";
import { ComponentTags } from "../constants/componenttypes";

class ThemeView extends Component {
  constructor(props) {
    super(props);
    this.state = { quickColor: '' };
  }

  active() {
    return !!this.props.active;
  }

  getSpaceFields(formType, mediaSize, formTheme, themeColors = {}) {
    // ComponentTags
    if (formType && mediaSize) {
      return [{
        placeholder: SpaceThemePropertyKeys.Padding,
        label: SpaceThemePropertyKeys.Padding,
        key: SpaceThemePropertyKeys.Padding
      }, {
        placeholder: SpaceThemePropertyKeys.Margin,
        label: SpaceThemePropertyKeys.Margin,
        key: SpaceThemePropertyKeys.Margin
      }].map(field => {
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
    const { themeColors = {} } = graph;

    const colors = Object.keys(ThemeColors).map(color => {
      if (themeColors) {
        return [(<ColorInput
          value={themeColors[color]}
          immediate
          label={`${color} : ${themeColors[color]}`}
          key={`color-${color}`}
          onChange={value => {
            this.props.updateGraph('themeColors', { ...themeColors, [color]: value })
          }}
          placeholder={color}
        />)]
      }
      return null;
    }).filter(x => x);

    return (
      <TopViewer active={active}>
        <section className="content">
          <div className="row">
            <div className="col-md-2">
              <Box maxheight={600} title={Titles.Style}>
                <FormControl>
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
              <Box maxheight={500} title={Titles.Style}>
                <FormControl>
                  {colors}
                </FormControl>
              </Box>
            </div>
            <div className="col-md-2" >
              <Box maxheight={500} title={Titles.FormStyle}>

                <FormControl>
                  <SelectInput
                    options={Object.keys(FormTypes).map(v => ({ title: v, value: v, id: v }))}
                    label={Titles.Parents}
                    onChange={(value) => {
                      this.setState({ formType: value })
                    }}
                    value={this.state.formType} />
                  <SelectInput
                    options={Object.keys(MediaSize).map(v => ({ title: v, value: v, id: v }))}
                    label={Titles.Parents}
                    onChange={(value) => {
                      this.setState({ mediaSize: value })
                    }}
                    value={this.state.mediaSize} />

                  {this.getFormFields(this.state.formType, this.state.mediaSize, formTheme, themeColors)}
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
            <div className="col-md-4" />
          </div>
        </section>
      </TopViewer>
    );
  }

}

export default UIConnect(ThemeView);
