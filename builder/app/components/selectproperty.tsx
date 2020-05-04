// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import CheckBox from "./checkbox";
import SelectInput from "./selectinput";

class SelectProperty extends Component<any, any> {
  render() {
    let currentNode = this.props.node;
    return (
      <SelectInput
        label={this.props.title}
        title={this.props.title}
        options={this.props.options}
        value={UIA.GetNodeProp(currentNode, this.props.property)}
        onChange={(value: any) => {
          let ops = [];
          if (this.props.link) {
            let oldprop = UIA.GetNodeProp(currentNode, this.props.property);
            if (oldprop) {
              ops.push({
                operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                options: {
                  source: currentNode.id,
                  target: oldprop
                }
              });
            }
            ops.push({
              operation: UIA.ADD_LINK_BETWEEN_NODES,
              options: {
                source: currentNode.id,
                target: value,
                properties: { ...this.props.link }
              }
            });
          }
          this.props.graphOperation([
            ...ops,
            {
              operation: UIA.CHANGE_NODE_PROPERTY,
              options: {
                prop: this.props.property,
                id: currentNode.id,
                value: value
              }
            }
          ]);
        }}
      />
    );
  }
}

export default UIConnect(SelectProperty);
