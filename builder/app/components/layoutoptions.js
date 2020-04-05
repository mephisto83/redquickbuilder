

/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from "react";
import TreeViewMenu from "./treeviewmenu";
import { Visual, NodeProperties, GetNodesByProperties, SELECTED_NODE, Node } from "../actions/uiactions";
import { SOURCE, GetConnectedNodesByType } from "../methods/graph_methods";
import { NodeTypes } from "../constants/nodetypes";
import { UIConnect } from "../utils/utils";
import * as Titles from './titles';
import TinyTweaks from "../nodepacks/TinyTweaks";
import BasicApplicationLayout from "../nodepacks/BasicApplicationLayout";
import BasicDoubleSideColumn from "../nodepacks/BasicDoubleSideColumn";
import FourColumn from "../nodepacks/FourColumn";
import ThreeColumn from "../nodepacks/ThreeColumn";
import GridHeaderMainMenuMain from "../nodepacks/layouts/GridHeaderMainMenuMain";
import ListItemGrid from "../nodepacks/layouts/ListItemGrid";
import FunctionExecutor from './functionexecutor';

class LayoutOptions extends Component {
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
    const { state } = this.props;
    const currentNode = Node(state, Visual(state, SELECTED_NODE));
    const layoutoptions = () => (
      <TreeViewMenu
        open={Visual(state, "layoutoptions")}
        active
        title={Titles.Layout}
        innerStyle={{  overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual("layoutoptions");
        }}
      >
        <TreeViewMenu
          title="Set Tiny Tweaks Layout"
          onClick={() => {
            this.props.graphOperation(
              TinyTweaks({ component: currentNode.id })
            );
          }}
        />
        <TreeViewMenu
          title="Basic Application Layout"

          onClick={() => {
            this.props.graphOperation(
              BasicApplicationLayout({ component: currentNode.id })
            );
          }}
        />
        <TreeViewMenu
          title="Basic Double Side Column"

          onClick={() => {
            this.props.graphOperation(
              BasicDoubleSideColumn({ component: currentNode.id })
            );
          }}
        />
        <TreeViewMenu
          title="Four Column"

          onClick={() => {
            this.props.graphOperation(
              FourColumn({ component: currentNode.id })
            );
          }}
        />
        <TreeViewMenu
          title="Three Column"

          onClick={() => {
            this.props.graphOperation(
              ThreeColumn({ component: currentNode.id })
            );
          }}
        />
        <TreeViewMenu title="Header MainMenu Main" onClick={() => {
          this.props.graphOperation(GridHeaderMainMenuMain({
            component: currentNode.id
          }));
        }} />
        <FunctionExecutor node={currentNode} title={ListItemGrid.title} targetFunction={ListItemGrid} />

      </TreeViewMenu>
    );
    return layoutoptions();
  }
}

export default UIConnect(LayoutOptions);
