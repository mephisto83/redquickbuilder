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
import ProgressBar from "./progressbar";
import { Visual, BuildAllProgress } from "../templates/electronio/v1/app/actions/uiActions";

class ProgressView extends Component {
  constructor(props) {
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

    return (
      <TopViewer active={active} >
        <section className="content">
          <div className="row">
            <div className="col-md-12">
              <h1>Build All Progress</h1>
              <Box maxheight={600} title={Titles.Input} onSearch={(search) => {
                this.setState({
                  titleSearch: search
                });
              }}>
                <ProgressBar steps={Visual(this.props.state, BuildAllProgress)} />
              </Box>
            </div>
          </div>
        </section>
      </TopViewer>
    );
  }

}

export default UIConnect(ProgressView);
