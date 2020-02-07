// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import CheckBox from "./checkbox";

class CheckBoxProperty extends Component {
  render() {
    let currentNode = this.props.node;
    return (
      <CheckBox
        label={this.props.title}
        title={this.props.title}
        value={UIA.GetNodeProp(currentNode, this.props.property)}
        onChange={value => {
          this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
            prop: this.props.property,
            id: currentNode.id,
            value: value
          });
        }}
      />
    );
  }
}

export default UIConnect(CheckBoxProperty);
