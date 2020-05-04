/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from "react";
import TreeViewMenu from "./treeviewmenu";
import { Visual, NodeProperties, GetNodesByProperties, GetNodeProp } from "../actions/uiactions";
import TreeViewItemContainer from "./treeviewitemcontainer";
import SelectInput from "./selectinput";
import { SOURCE, GetConnectedNodesByType, GetCellIdByTag, GetCellProperties, GetChildren, GetChild } from "../methods/graph_methods";
import { NodeTypes } from "../constants/nodetypes";
import { UIConnect } from "../utils/utils";

class FunctionExecutor extends Component<any, any> {
  constructor(props: any) {
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

  getDefaults() {
    const { node, targetFunction } = this.props;
    const defaults = {};
    if (targetFunction && targetFunction.callingArguments) {
      const layout = GetNodeProp(node, NodeProperties.Layout);

      if (layout) {
        targetFunction.callingArguments.forEach(d => {
          const cellId = GetCellIdByTag(layout, d.field.upperCaseFirst());
          if (cellId) {
            const children = GetChild(layout, cellId);
            if (children) {
              defaults[d.field] = children
            }
          }
        });
      }
    }
    return defaults;
  }

  render() {
    const { targetFunction, state, node } = this.props;
    const nodes = this.getComponents().toNodeSelect();
    const defaults = this.getDefaults() || {};
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
              onChange={(value: any) => {
                this.setState({ [arg.name]: value });
              }}
              value={this.state[arg.name] || defaults[arg.name]} />
          </TreeViewItemContainer>
        ))}
        <TreeViewMenu
          title={targetFunction.title}
          description={targetFunction.description}
          onClick={() => {
            const funcArgs = {};
            targetFunction.callingArguments.forEach(arg => {
              funcArgs[arg.name] = this.state[arg.name] || defaults[arg.name] || null;
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
