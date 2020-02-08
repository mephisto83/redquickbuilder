// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import ButtonList from "./buttonlist";
import { ComponentTags } from "../constants/componenttypes";
import { NodeProperties } from "../constants/nodetypes";
import * as Titles from "./titles";
import { StyleLib } from "../constants/styles";
import SelectInput from "./selectinput";

class GridPlacement extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let currentNode = this.props.node;
    let tags =
      UIA.GetNodeProp(
        currentNode,
        this.props.property || NodeProperties.GridAreas
      ) || [];
    let cellStyle = UIA.GetNodeProp(currentNode, NodeProperties.Style) || {};
    if (cellStyle && !cellStyle["gridTemplateColumns"]) {
      return <div />;
    }
    let gridColumns = cellStyle["gridTemplateColumns"];
    let gridRowCount = parseInt(
      UIA.GetNodeProp(currentNode, NodeProperties.GridRowCount) || 1,
      10
    );
    let columns = gridColumns.split(" ").filter(x => x);
    let square = {
      display: "flex",
      flex: 1,
      height: 24,
      border: "solid 1px #414141",
      ...(this.state.currentSection ? { cursor: "pointer" } : {})
    };

    let gridplacement =
      UIA.GetNodeProp(currentNode, NodeProperties.GridPlacement) ||
      [].interpolate(0, 100, t => "");

    return (
      <div>
        <SelectInput
          label={Titles.GridAreas}
          title={Titles.GridAreas}
          options={tags.map(x => ({ title: x, id: x, value: x }))}
          value={this.state.currentSection}
          onChange={value => {
            this.setState({ currentSection: value });
          }}
        />
        <div style={{ paddingBottom: 5 }}>
          <div className={"btn-group"}>
            <button
              className={"btn btn-default bg-olive btn-flat"}
              onClick={() => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop:
                    this.props.property ||
                    NodeProperties.GridPlacement,
                  id: currentNode.id,
                  value: null
                });
              }}
            >
              <i className={"fa  fa-times"} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
          {[].interpolate(0, gridRowCount, row => {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                {columns.map((_, col) => {
                  return (
                    <div
                      title={gridplacement[row * columns.length + col]}
                      style={{
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
                          this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop:
                              this.props.property ||
                              NodeProperties.GridPlacement,
                            id: currentNode.id,
                            value: gridplacement
                          });
                        }
                      }}
                    />
                  );
                })}{" "}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default UIConnect(GridPlacement);
