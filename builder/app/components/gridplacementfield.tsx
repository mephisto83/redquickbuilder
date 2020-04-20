/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/button-has-type */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import ButtonList from "./buttonlist";
import { ComponentTags } from "../constants/componenttypes";
import { NodeProperties, MediaQueries } from "../constants/nodetypes";
import * as Titles from "./titles";
import { StyleLib } from "../constants/styles";
import SelectInput from "./selectinput";
import TextInput from "./textinput";
import Typeahead from "./typeahead";
import CheckBox from "./checkbox";

export default class GridPlacementField extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const tags = this.props.tags || [];
    const gridSetup = this.props.gridSetup || {};
    const {
      gridTemplateColumns = "",
      gridTemplateRows = "",
      gridTemplateRowGap = '',
      gridTemplateColumnGap = '',
      name = "",
      mediaSizes = {},
      gridPlacement
    } = gridSetup;
    const gridRowCount = gridTemplateRows ? gridTemplateRows.split(' - ').join('-').split(' ').filter(x => x).length || 1 : 1;
    const columns = gridTemplateColumns.split(" ").filter(x => x);
    const square = {
      display: "flex",
      flex: 1,
      height: this.props.squareHeight || 24,
      width: this.props.squareHeight || 24,
      border: "solid 1px #414141",
      ...(this.state.currentSection ? { cursor: "pointer" } : {})
    };

    const gridplacement = gridPlacement || [].interpolate(0, Math.max(columns * gridRowCount, 100), () => "");

    return (
      <div className="row">
        <div className="col-md-3">
          <TextInput
            label={Titles.Name}
            title={Titles.Name}
            value={name}
            onChange={value => {
              this.props.onChange({
                ...gridSetup,
                name: value
              })
            }} />
          <TextInput
            label={Titles.GridTemplateColumns}
            title={Titles.GridTemplateColumns}
            value={gridTemplateColumns}
            onChange={value => {
              this.props.onChange({
                ...gridSetup,
                gridTemplateColumns: value
              })
            }} />
          <TextInput
            label={Titles.GridTemplateRows}
            title={Titles.GridTemplateRows}
            value={gridTemplateRows}
            onChange={value => {
              this.props.onChange({
                ...gridSetup,
                gridTemplateRows: value
              })
            }} />
          <TextInput
            label={Titles.GridColumnGap}
            title={Titles.GridColumnGap}
            value={gridTemplateColumnGap}
            onChange={value => {
              this.props.onChange({
                ...gridSetup,
                gridTemplateColumnGap: value
              })
            }} />
            <TextInput
              label={Titles.GridRowGap}
              title={Titles.GridRowGap}
              value={gridTemplateRowGap}
              onChange={value => {
                this.props.onChange({
                  ...gridSetup,
                  gridTemplateRowGap: value
                })
              }} />
          <Typeahead
            label={Titles.GridAreas}
            title={Titles.GridAreas}
            options={tags.map(x => ({ title: x, id: x, value: x }))}
            value={this.state.currentSection}
            onChange={value => {
              this.setState({ currentSection: value });
            }}
          />
        </div>
        <div className="col-md-6">
          <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
            {[].interpolate(0, gridRowCount, row => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                {columns.map((_, col) => (
                  <div
                    title={gridplacement[row * columns.length + col]}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      ...square,
                      ...(gridplacement[row * columns.length + col] ===
                        this.state.currentSection
                        ? { backgroundColor: UIA.Colors.SelectedNode }
                        : gridplacement[row * columns.length + col]
                          ? { backgroundColor: UIA.Colors.MarkedNode }
                          : {})
                    }}
                    onClick={() => {
                      if (this.state.currentSection) {
                        if (
                          gridplacement[row * columns.length + col] !==
                          this.state.currentSection
                        ) {
                          gridplacement[
                            row * columns.length + col
                          ] = this.state.currentSection;
                        } else {
                          gridplacement[row * columns.length + col] = "";
                        }
                        this.props.onChange({
                          ...gridSetup,
                          gridTemplateColumns,
                          gridTemplateRows,
                          gridPlacement: gridplacement
                        });
                      }
                    }}
                  >{gridplacement[row * columns.length + col] || ''}</div>
                ))}{' '}
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-3">
          {Object.keys(MediaQueries).map(mediaSize => (<CheckBox
            label={mediaSize}
            title={mediaSize}
            key={`mediasize-${mediaSize}`}
            value={mediaSizes[mediaSize]}
            onChange={value => {
              this.props.onChange({
                ...gridSetup,
                mediaSizes: {
                  ...mediaSizes,
                  [mediaSize]: value
                }
              })
            }} />))}
        </div>
      </div>
    );
  }
}


