// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiActions";
import TextInput from "./textinput";

class TextProperty extends Component<any, any> {
  render() {
    let currentNode = this.props.node;
    return (
      <TextInput
        label={this.props.label}
        title={this.props.title}
        immediate={this.props.immediate}
        value={
          currentNode.properties
            ? currentNode.properties[this.props.property]
            : ""
        }
        onChange={(value: any) => {
          this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
            prop: this.props.property,
            id: currentNode.id,
            value
          });
        }}
      />
    );
  }
}

export default UIConnect(TextProperty);
