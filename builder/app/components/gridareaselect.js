// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import ButtonList from "./buttonlist";
import { ComponentTags } from "../constants/componenttypes";
import { NodeProperties } from "../constants/nodetypes";
import * as Titles from "./titles";

class GridAreaSelect extends Component {
  render() {
    let currentNode = this.props.node;
    let tags =
      UIA.GetNodeProp(
        currentNode,
        this.props.property || NodeProperties.GridAreas
      ) || [];
    return (
      <ButtonList
        label={this.props.title || Titles.GridAreas}
        title={this.props.title || Titles.GridAreas}
        active={true}
        items={Object.keys(ComponentTags).map(x => ({
          id: x,
          value: x,
          title: x
        }))}
        value={UIA.GetNodeProp(
          currentNode,
          this.props.property || NodeProperties.GridAreas
        )}
        isSelected={item => {
          if (tags) {
            return (tags || []).some(v => v === item.value);
          }
          return false;
        }}
        onClick={item => {
          if (tags.find(v => v === item.value)) {
            let index = tags.findIndex(v => v === item.value);
            tags.splice(index, 1);
          } else {
            tags.push(item.value);
          }
          this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
            prop:  this.props.property || NodeProperties.GridAreas,
            id: currentNode.id,
            value: tags
          });
        }}
      />
    );
  }
}

export default UIConnect(GridAreaSelect);
