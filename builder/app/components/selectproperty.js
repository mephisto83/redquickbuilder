// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import CheckBox from "./checkbox";
import SelectInput from "./selectinput";

class SelectProperty extends Component {
  render() {
    let currentNode = this.props.node;
    return (
      <SelectInput
        label={this.props.title}
        title={this.props.title}
        options={this.props.options}
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

export default UIConnect(SelectProperty);
