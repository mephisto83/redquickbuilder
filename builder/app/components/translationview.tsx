/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
/* eslint-disable class-methods-use-this */
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
import { GetCurrentGraph, GUID, GetNodes, GetNodeTitle, NodesByType, NodeProperties, GetNodeProp } from "../actions/uiactions";
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
import { MediaQueries, Languages, NodeTypes } from "../constants/nodetypes";
import translationservice from '../service/translationservice';
import GridPlacementField from "./gridplacementfield";

class TranslationView extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  active() {
    return !!this.props.active;
  }

  getTranslation(item, language) {
    if (item && item.properties && item.properties.languages) {
      return `${language}: ${item.properties.languages[language]}`;
    }
    return `${language}: ${Titles.Unknown}`;
  }

  render() {
    const active = this.active();
    const graph = GetCurrentGraph();
    if (!graph) {
      return <div />;
    }
    const {
      languageTitles = { titles: {} }
    } = graph;
    const nodesForTranslation = NodesByType(null, [
      NodeTypes.Model,
      NodeTypes.ComponentNode,
      NodeTypes.Screen,
      NodeTypes.ScreenOption].filter(x => !this.state[x]))
      .filter(x => this.state.OnlyUntranslated ? !languageTitles.titles[x.id] : true)
      .filter(x => this.state.titleSearch && `${GetNodeProp(x, NodeProperties.Label)} ${x.id} ${GetNodeTitle(x)}`.toLowerCase().indexOf(this.state.titleSearch.toLowerCase()) !== -1);
    return (
      <TopViewer active={active} >
        <section className="content">
          <div className="row">
            <div className="col-md-3">
              <Box maxheight={600} title={Titles.Input} onSearch={(search) => {
                this.setState({
                  titleSearch: search
                });
              }}>
                <CheckBox
                  label={Titles.OnlyUntranslated}
                  onChange={(value) => {
                    this.setState({ OnlyUntranslated: value })
                  }}
                  value={this.state.OnlyUntranslated} />{
                  [
                    NodeTypes.Model,
                    NodeTypes.ComponentNode,
                    NodeTypes.Screen,
                    NodeTypes.ScreenOption].map(nodeType => {
                      return (<CheckBox
                        label={`Exclude ${nodeType}`}
                        key={`node-type-${nodeType}`}
                        onChange={(value) => {
                          this.setState({ [nodeType]: value })
                        }}
                        value={this.state[nodeType]} />)
                    })}
                <ButtonList
                  active
                  items={nodesForTranslation.map(v => (
                    languageTitles.titles[v.id] || {
                      title: GetNodeTitle(v),
                      id: v.id,
                      properties: {}
                    })).sort((a, b) => GetNodeTitle(a.id).localeCompare(GetNodeTitle(b.id)))}
                  renderItem={(item) => (<div className="col-md-12" style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <div className="col-md-10" >
                      <h5 style={{ margin: 0 }}>{GetNodeTitle(item.id)}</h5>
                      <h5 style={{ margin: 0 }}>{this.getTranslation(item, Languages["US-English"])}</h5>
                      <h5 style={{ margin: 0 }}>{this.getTranslation(item, Languages["NB-Norsk"])}</h5>
                      <h5 style={{ margin: 0 }}>{this.getTranslation(item, Languages["FR-Francais"])}</h5>
                    </div>
                    <div className="col-md-2">
                      {this.state.copied ? (<button className="btn btn-default btn-flat" onClick={(event) => {
                        languageTitles.titles[item.id] = {
                          properties: JSON.parse(JSON.stringify(this.state.copied)).properties,
                          id: item.id,
                          title: GetNodeTitle(item.id)
                        };
                        this.props.updateGraph('languageTitles', { ...languageTitles });
                        event.stopPropagation();

                        return null;
                      }} ><i className="fa fa-paste" /></button>) : null}
                    </div>
                  </div>)}
                  onClick={item => {
                    item.properties.languages = item.properties.languages || {};
                    if (item && item.properties && item.properties.languages && !item.properties.languages[Languages["US-English"]]) {
                      item.properties.languages[Languages["US-English"]] = GetNodeTitle(item.id);
                    }
                    this.setState({
                      selectedId: item.id,
                      item: { ...item }
                    })
                  }}
                />
              </Box>
            </div>
            <div className="col-md-3">
              {this.state.selectedId ? (<Box maxheight={600} title={Titles.Input}>
                <FormControl>
                  <h2 style={{ marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}>{GetNodeTitle(this.state.selectedId)}</h2>
                  <h3 style={{
                    marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0
                  }}>{GetNodeProp(this.state.selectedId, NodeProperties.NODEType)}</h3>
                  <h4>{GetNodeProp(this.state.selectedId, NodeProperties.NODEType) === NodeTypes.ComponentNode ? GetNodeProp(this.state.selectedId, NodeProperties.ComponentType) : ''}</h4>
                  {Object.keys(Languages).map(language => {
                    return (<TextInput
                      value={this.state.item && this.state.item.properties && this.state.item.properties.languages ? this.state.item.properties.languages[language] : ''}
                      immediate
                      label={language}
                      onChanged={(value) => {
                        if (language === Languages["US-English"]) {
                          if (value) {
                            const { item } = this.state;
                            translationservice(value, Languages["US-English"], Languages["FR-Francais"]).then(res => {
                              item.properties.languages[Languages["FR-Francais"]] = res;
                              return translationservice(value, Languages["US-English"], Languages["NB-Norsk"]).then(ress => {
                                item.properties.languages[Languages["NB-Norsk"]] = ress;
                                this.setState({ item: { ...item } })
                              })
                            });
                          }
                        }
                      }}
                      onChange={(value: any) => {
                        const { item } = this.state;
                        item.properties = item.properties || {};
                        item.properties.languages = item.properties.languages || {};
                        item.properties.languages[language] = value;
                        this.setState({ item: { ...item } })
                      }}
                      placeholder={language}
                    />)
                  })}
                </FormControl>
                <div className="btn-group">
                  <button className="btn btn-default btn-primary" onClick={(event) => {
                    languageTitles.titles[this.state.selectedId] = { ...this.state.item };
                    this.props.updateGraph('languageTitles', { ...languageTitles });
                    event.stopPropagation();
                    return null;
                  }} >Set</button>
                  <button className="btn btn-default btn-primary" onClick={(event) => {
                    this.setState({
                      copied: JSON.parse(JSON.stringify(this.state.item))
                    })
                    return null;
                  }} >Copy</button>
                  {this.state.copied ? (<button className="btn btn-default btn-primary" onClick={(event) => {

                    languageTitles.titles[item.id] = {
                      properties: JSON.parse(JSON.stringify(this.state.copied)).properties,
                      id: item.id,
                      title: GetNodeTitle(item.id)
                    };
                    this.props.updateGraph('languageTitles', { ...languageTitles });
                    event.stopPropagation();

                    return null;
                  }} >Paste</button>) : null}
                  {this.state.copied ? (<button className="btn btn-default btn-primary" onClick={(event) => {
                    if (confirm('Are you sure')) {
                      nodesForTranslation.map(item => {
                        languageTitles.titles[item.id] = {
                          properties: JSON.parse(JSON.stringify(this.state.copied)).properties,
                          id: item.id,
                          title: GetNodeTitle(item.id)
                        };
                      })
                      this.props.updateGraph('languageTitles', { ...languageTitles });
                    }

                    return null;
                  }} >Paste All</button>) : null}
                </div>
              </Box>) : null}

            </div>
          </div>
        </section>
      </TopViewer>
    );
  }

}

export default UIConnect(TranslationView);
