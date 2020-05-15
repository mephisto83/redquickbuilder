/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import TopViewer from "./topviewer";
import { StyleLib } from '../constants/styles';

import {
  ThemeColors,
  FormThemePropertyKeys,
  HTMLElementGroups,
  ColorUses,
  OtherUses,
  CssPseudoSelectors
} from "../constants/themes";
import { GetCurrentGraph, GUID, VisualEq } from "../actions/uiactions";
import TextInput from "./textinput";
import ColorInput from './colorinput';
import Box from "./box";
import FormControl from "./formcontrol";
import * as Titles from './titles';
import SelectInput from "./selectinput";
import { ComponentTags } from "../constants/componenttypes";
import CheckBox from "./checkbox";
import ButtonList from "./buttonlist";
import Typeahead from "./typeahead";
import { MediaQueries } from "../constants/nodetypes";
import GridPlacementField from "./gridplacementfield";
import TabContainer from "./tabcontainer";
import Tabs from "./tabs";
import TabContent from "./tabcontent";
import TabPane from "./tabpane";
import Tab from "./tab";
const THEME_VIEW_TAB = 'theme-view-tab';

class ThemeView extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { quickColor: '', bindAll: true, mediaSize: MediaQueries["Extra devices"] };
  }

  active() {
    return !!this.props.active;
  }

  getEditBoxes(formType, mediaSize, formTheme, themeColors, config, themeVariables, filterFunc) {
    // ComponentTags
    if (formType && mediaSize) {
      return Object.values(StyleLib.css).filter(v => (
        formTheme &&
        formTheme[formType] &&
        formTheme[formType][mediaSize] &&
        formTheme[formType][mediaSize][v.label]
      ) || filterFunc(`${v.label}`)).map(field => {
        const { placeholder, key, type } = field;
        let { label } = field;
        label = `${label}`;
        formType = `${formType}${this.getAttrSelector()}`;

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

          Object.keys(MediaQueries).forEach(ms => {
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
            color={themeColors ? themeColors[`${fieldValue}`.split('--').join('')] : null}
            onChange={onChange}
            options={Object.keys(ThemeColors).map(d => ({ title: d, value: `--${d}` }))} />)
        }
        const use = key;
        const variableNameParts = `${label.split(':')[0]}`.split('-').map(v => v.toLowerCase());
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

  getAttrSelector() {
    let selector = '';

    Object.keys(CssPseudoSelectors).filter(v => this.state[v]).sort().forEach(v => {
      selector += v;
    })

    return selector;
  }

  getSpaceFields(formType, mediaSize, formTheme, themeColors = {}, themeVariables, filterFunc) {
    // ComponentTags
    if (formType && mediaSize) {
      return Object.values(StyleLib.css).filter(v => (
        formTheme &&
        formTheme[formType] &&
        formTheme[formType][mediaSize] &&
        formTheme[formType][mediaSize][v.label]
      ) || filterFunc(`${v.label}`)).map(field => {
        const { placeholder, key, type } = field;
        let { label } = field;
        label = `${label}`;
        formType = `${formType}${this.getAttrSelector()}`;

        const onChange = (value) => {
          value = `${value || ''}`;

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

          Object.keys(MediaQueries).forEach(ms => {
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
            color={themeColors ? themeColors[`${fieldValue}`.split('--').join('')] : null}
            onChange={onChange}
            options={Object.keys(ThemeColors).map(d => ({ title: d, value: `--${d}` }))} />)
        }

        const use = key;
        const variableNameParts = `${label.split(':')[0]}`.split('-').map(v => v.toLowerCase());
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

  render() {
    const active = this.active();

		if (!active) {
			return <div />;
    }

    const graph = GetCurrentGraph();
    if (!graph) {
      return <div />;
    }
    const { state } = this.props;
    const { spaceTheme = {} } = graph;
    const {
      themeColors = {},
      themeColorUses = {},
      themeOtherUses = {},
      themeGridPlacements = { grids: [] },
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
          onChange={(value: any) => {
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
          onChange={(value: any) => {
            this.props.updateGraph('themeColorUses', { ...themeColorUses, [use]: value });
          }}
          options={Object.keys(ThemeColors).map(d => ({ title: d, value: d }))} />)
      }
      return null;
    }).filter(x => x);

    const otherUses = Object.keys(OtherUses).map(use => {
      if (themeOtherUses) {
        const variableNameParts = ['font', 'size'];
        if (!variableNameParts.some(v => use.toLowerCase().indexOf(v) === -1)) {
          return (<Typeahead
            key={`field-font-family-${use}`}
            value={themeOtherUses ? themeOtherUses[use] : null}
            label={use}
            title={use}
            onChange={(value: any) => {
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
            onChange={(value: any) => {
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
          onChange={(value: any) => {
            this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
          }} />)
      }
      return null;
    }).filter(x => x);
    const htmlElementGroup = this.state.sectionType ? HTMLElementGroups.find(f => f.name === this.state.sectionType) : null;
    let sectionTypeOptions = [];
    if (htmlElementGroup) {
      sectionTypeOptions = Object.keys(htmlElementGroup.type).map(v => ({ title: v, value: v, id: v }));
    }
    return (
      <TopViewer active={active} >
        <section className="content">
          <div className="row">
            <div className="col-md-1">
              <Box maxheight={600} title={Titles.Style}>
                <FormControl>
                  <SelectInput
                    options={Object.keys(MediaQueries).map(v => ({ title: v, value: v, id: v }))}
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
                    onChange={(value: any) => {
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
                  {Object.keys(CssPseudoSelectors).sort().map(key => (<CheckBox
                    key={`check-box-${key}`}
                    label={key}
                    onChange={(value) => {
                      this.setState({ [key]: value })
                    }}
                    value={this.state[key]} />))}
                  <button className="btn btn-default btn-flat" onClick={() => {
                    const temp = {
                      // 'themeColors': {},
                      // 'themeColorUses': {},
                      'themeOtherUses': {},
                      // 'themeFonts': { fonts: [] },
                      // 'themeVariables': { variables: [] }
                    };
                    Object.keys(temp).map(v => {
                      this.props.updateGraph(v, temp[v]);
                    });
                  }} >Clear</button>
                </FormControl>
              </Box>
            </div>
            <div className="col-md-11">
              <TabContainer>
                <Tabs>
                  <Tab
                    active={VisualEq(state, THEME_VIEW_TAB, 'Variables')}
                    title={'Variables'}
                    onClick={() => {
                      this.props.setVisual(THEME_VIEW_TAB, 'Variables');
                    }}
                  />
                  <Tab
                    active={VisualEq(state, THEME_VIEW_TAB, 'Grid Placement')}
                    title={'Grid Placement'}
                    onClick={() => {
                      this.props.setVisual(THEME_VIEW_TAB, 'Grid Placement');
                    }}
                  />
                  <Tab
                    active={VisualEq(state, THEME_VIEW_TAB, 'Others')}
                    title={'Others'}
                    onClick={() => {
                      this.props.setVisual(THEME_VIEW_TAB, 'Others');
                    }}
                  />
                </Tabs>
              </TabContainer>
              <TabContent>
                <TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Variables')}>
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-6" >
                        <Box maxheight={350} title={Titles.Fonts}>
                          <FormControl>
                            <TextInput
                              value={this.state.fontName}
                              label={`${Titles.Font} ${Titles.Name}`}
                              title={`${Titles.Font} ${Titles.Name}`}
                              immediate
                              onChange={(value) => {
                                this.setState({ fontName: value })
                              }} />

                            <TextInput
                              value={this.state.font}
                              label={Titles.Font}
                              title={Titles.Font}
                              immediate
                              onChange={(value) => {
                                this.setState({ font: value })
                              }} />

                            <div className="row">
                              <div className="col-md-6"><TextInput
                                value={this.state.fontCss}
                                label={Titles.FontCss}
                                title={Titles.FontCss}
                                immediate
                                onChange={(value) => {
                                  this.setState({ fontCss: value })
                                }}
                              />
                              </div>
                              <div className="col-md-6">
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
                              </div>
                            </div>
                            {this.state.font && this.state.fontCss && this.state.fontName && this.state.fontCssVar ? <button className="btn btn-primary" onClick={(event) => {
                              if (this.state.font && this.state.fontCss && this.state.fontCssVar) {
                                themeFonts.fonts = [{
                                  font: this.state.font,
                                  fontCss: this.state.fontCss,
                                  fontCssVar: this.state.fontCssVar,
                                  fontName: this.state.fontName
                                }, ...themeFonts.fonts].unique(v => v.font + v.fontName);
                                this.props.updateGraph('themeFonts', { ...themeFonts });
                                this.setState({ font: '' })
                              }
                              event.stopPropagation();
                              return false;
                            }} >Ok</button> : null}
                            <ButtonList
                              active
                              items={themeFonts.fonts.map(v => ({ title: v.font, id: v.font, ...v }))}
                              renderItem={(item) => (<div className="col-md-12" style={{
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <div className="col-md-10" >
                                  <h5 style={{ margin: 0 }}>{item.font}</h5>
                                  <h5 style={{ margin: 0 }}>{item.fontCss}</h5>
                                  <h6 style={{ margin: 0 }}>{item.fontCssVar}</h6>
                                  <h6 style={{ margin: 0 }}>{item.fontName}</h6>
                                </div>
                                <div className="col-md-2">
                                  <button className="btn btn-default btn-flat" onClick={() => {
                                    themeFonts.fonts = themeFonts.fonts.filter(x => x.font !== item.id);
                                    this.props.updateGraph('themeFonts', { ...themeFonts })
                                  }}><i className="fa fa-times" /></button>
                                </div>
                              </div>)}
                              onClick={item => {
                                this.setState({
                                  ...item
                                })
                              }}
                            />
                          </FormControl>
                        </Box>
                      </div>
                      <div className="col-md-6">
                        <Box maxheight={350} title="Variables">
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
                            {this.state.variable && this.state.variableValue ? <button className={"btn btn-primary"} onClick={(event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              if (this.state.variable && this.state.variableValue) {
                                themeVariables.variables = [{
                                  variable: this.state.variable,
                                  variableValue: this.state.variableValue
                                }, ...themeVariables.variables].unique(v => v.variable);
                                this.props.updateGraph('themeVariables', { ...themeVariables });
                              }
                              return false;
                            }} >Ok</button> : null}
                            <ButtonList
                              active
                              items={themeVariables.variables.map(v => ({ title: v.variable, id: v.variable, ...v }))}
                              renderItem={(item) => (<div className="col-md-12" style={{
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <div className="col-md-10" >
                                  <h5 style={{ margin: 0 }}>{item.variable}</h5>
                                  <h6 style={{ margin: 0 }}>{item.variableValue}</h6>
                                </div>
                                <div className="col-md-2">
                                  <button className="btn btn-default btn-flat" onClick={() => {
                                    themeVariables.variables = themeVariables.variables.filter(x => x.variable !== item.id);
                                    this.props.updateGraph('themeVariables', { ...themeVariables })
                                  }}><i className="fa fa-times" /></button>
                                </div>
                              </div>)}
                              onClick={() => {
                              }}
                            />
                          </FormControl>

                        </Box>
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Grid Placement')}>
                  <div className="row">
                    <div className="col-md-3">
                      <Box title={`${Titles.GridPlacement}`}>
                        <TextInput
                          value={this.state.gridGroup}
                          label={`${Titles.GridPlacement} ${Titles.Name}`}
                          immediate
                          inputgroup
                          title={`${Titles.GridPlacement} ${Titles.Name}`}
                          onChange={(value) => {
                            this.setState({ gridGroup: value })
                          }}
                          onClick={() => {
                            let { gridGroup } = this.state
                            if (gridGroup && gridGroup.trim()) {
                              gridGroup = gridGroup.trim();
                              this.props.updateGraph('themeGridPlacements', {
                                grids: [{
                                  id: GUID(),
                                  name: gridGroup,
                                  gridTemplateColumns: "",
                                  gridTemplateRows: "",
                                  gridPlacement: null
                                }, ...themeGridPlacements.grids]
                              });
                            }
                          }}
                        />
                        <ButtonList
                          active
                          items={themeGridPlacements.grids.map(v => ({ title: v.name, ...v }))}
                          isSelected={(v) => v.id === this.state.currentGrid}
                          renderItem={(item) => (<div className="col-md-12" style={{
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <div className="col-md-10" >
                              <h4 style={{ margin: 0 }}>{item.name}</h4>
                              <h5 style={{ margin: 0 }}>{item.gridTemplateColumns}</h5>
                              <h6 style={{ margin: 0 }}>{item.gridTemplateRows}</h6>
                            </div>
                            <div className="col-md-2">
                              <button className="btn btn-default btn-flat" onClick={() => {
                                themeGridPlacements.grids = themeGridPlacements.grids.filter(x => x.id !== item.id);
                                this.props.updateGraph('themeGridPlacements', {
                                  ...themeGridPlacements,
                                  grids: themeGridPlacements.grids
                                });
                              }}><i className="fa fa-times" /></button>
                            </div>
                          </div>)}
                          onClick={item => {
                            this.setState({ currentGrid: item.id })
                          }}
                        />
                      </Box>
                    </div>
                    <div className="col-md-9">
                      <Box title={Titles.GridPlacement}>
                        <GridPlacementField
                          squareHeight={100}
                          gridSetup={themeGridPlacements.grids.find(x => x.id === this.state.currentGrid)}
                          onChange={(setup) => {
                            this.props.updateGraph('themeGridPlacements', {
                              ...themeGridPlacements,
                              grids: [setup, ...themeGridPlacements.grids.filter(x => x.id !== setup.id)]
                            });
                          }} tags={Object.keys(ComponentTags)} />
                      </Box>
                    </div>
                  </div>
                </TabPane>
                <TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Others')}>
                  <div className="row">
                    <div className="col-md-2" >
                      <Box maxheight={500} title={Titles.Style}>
                        <FormControl>
                          {colors}
                        </FormControl>
                      </Box>
                    </div>
                    <div className="col-md-3" >
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
                      <Box maxheight={500} title={Titles.SpaceTheme} onSearch={(search) => {
                        this.setState({
                          spaceSearch: search
                        });
                      }}>
                        <FormControl>
                          <Typeahead
                            options={Object.keys(ComponentTags).map(v => ({ title: v, value: v, id: v }))}
                            label="Spaces"
                            onChange={(value) => {
                              this.setState({ componentTag: value })
                            }}
                            value={this.state.componentTag} />

                          {this.getSpaceFields(this.state.componentTag, this.state.mediaSize, spaceTheme, themeColors, themeVariables, f => this.state.spaceSearch && f.toLowerCase().indexOf(this.state.spaceSearch.toLowerCase()) !== -1)}
                          <div style={{ height: 300 }}></div>
                        </FormControl>
                      </Box>
                    </div>
                    <div className="col-md-2" >
                      <Box maxheight={500} title={this.state.sectionType || 'Search'} onSearch={(search) => {
                        this.setState({
                          [`search-${this.state.sectionType || 'search'}`]: search
                        });
                      }}>
                        <FormControl>
                          <SelectInput
                            options={HTMLElementGroups.map(v => ({ title: v.name, value: v.name, id: v.name }))}
                            label="Section Types"
                            onChange={(value) => {
                              this.setState({ sectionType: value })
                            }}
                            value={this.state.sectionType} />
                          {this.state.sectionType ? <SelectInput
                            options={sectionTypeOptions}
                            label={this.state.sectionType}
                            onChange={(value) => {
                              this.setState({ [this.state.sectionType]: value })
                            }}
                            value={this.state[this.state.sectionType]} /> : null}
                          {this.getEditBoxes(this.state[this.state.sectionType],
                            this.state.mediaSize,
                            spaceTheme,
                            themeColors,
                            HTMLElementGroups.find(f => f.name === this.state.sectionType),
                            themeVariables, f => this.state[`search-${this.state.sectionType}`] && f.toLowerCase().indexOf(`${this.state[`search-${this.state.sectionType}`]}`.toLowerCase()) !== -1)}
                        </FormControl>
                      </Box>
                    </div>
                  </div>

                </TabPane>
              </TabContent>
            </div>
          </div>
        </section>
      </TopViewer >
    );
  }

}

export default UIConnect(ThemeView);
