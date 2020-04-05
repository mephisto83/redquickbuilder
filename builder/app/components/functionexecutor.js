/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from "react";
import TreeViewMenu from "./treeviewmenu";
import { Visual, NodeProperties, GetNodesByProperties } from "../actions/uiactions";
import TreeViewItemContainer from "./treeviewitemcontainer";
import SelectInput from "./selectinput";
import { SOURCE, GetConnectedNodesByType } from "../methods/graph_methods";
import { NodeTypes } from "../constants/nodetypes";
import { UIConnect } from "../utils/utils";

class FunctionExecutor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getComponents() {
    const { state, node } = this.props;
    let componentNodes = node
      ? GetConnectedNodesByType(
        state,
        node.id,
        NodeTypes.ComponentNode,
        SOURCE
      )
      : [];
    componentNodes = [
      ...componentNodes,
      ...GetNodesByProperties(
        {
          [NodeProperties.NODEType]: NodeTypes.ComponentNode,
          [NodeProperties.SharedComponent]: true
        },
        null,
        state
      ),
      ...GetNodesByProperties(
        {
          [NodeProperties.NODEType]: NodeTypes.ViewType
        },
        null,
        state
      )
    ];
    return componentNodes;
  }

  render() {
    const { targetFunction, state, node } = this.props;
    const nodes = this.getComponents().toNodeSelect();
    return (
      <TreeViewMenu open={Visual(state, targetFunction.title)}
        active
        title={this.props.title}
        innerStyle={{ maxHeight: 500, overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual(targetFunction.title);
        }}>
        {targetFunction.callingArguments.map(arg => (
            <TreeViewItemContainer key={arg.name}>
              <SelectInput
                options={nodes}
                label={arg.name}
                onChange={value => {
                  this.setState({ [arg.name]: value });
                }}
                value={this.state[arg.name]} />
            </TreeViewItemContainer>
          ))}
        <TreeViewMenu
          title={targetFunction.title}
          description={targetFunction.description}
          onClick={() => {
            const funcArgs = {};
            targetFunction.callingArguments.forEach(arg => {
              funcArgs[arg.name] = this.state[arg.name] || null;
            })
            this.props.graphOperation(targetFunction({
              component: node.id,
              ...funcArgs
            }));
          }} />
      </TreeViewMenu>

    );
  }
}

export default UIConnect(FunctionExecutor);
