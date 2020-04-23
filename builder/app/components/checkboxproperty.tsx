/* eslint-disable react/prop-types */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import CheckBox from "./checkbox";

class CheckBoxProperty extends Component {
  render() {
    const currentNode = this.props.node;
    const { link, property } = this.props
    return (
      <CheckBox
        label={this.props.title}
        title={this.props.title}
        value={link ? UIA.GetLinkProperty(link, this.props.property) : UIA.GetNodeProp(currentNode, this.props.property)}
        onChange={value => {
          if (this.props.link) {
            this.props.graphOperation([
              {
                operation: UIA.UPDATE_LINK_PROPERTY,
                options() {
                  return {
                    id: link.id,
                    prop: property,
                    value
                  };
                }
              }
            ]);
          }
          else {
            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
              prop: this.props.property,
              id: currentNode.id,
              value
            });
          }
        }}
      />
    );
  }
}

export default UIConnect(CheckBoxProperty);