/* eslint-disable func-names */
/* eslint-disable no-unused-vars */


import React from 'react';
import TreeViewMenu from './treeviewmenu';
import { Visual, Node, SELECTED_NODE } from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import { ComponentTypes } from '../constants/componenttypes';
import AddComponent from '../nodepacks/AddComponent';
import { UIConnect } from '../utils/utils';
 class AddComponentMenu extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {};

  }

  render() {
    const { state } = this.props;
    const currentNode = Node(state, Visual(state, SELECTED_NODE));

    return (
      <TreeViewMenu
        open={Visual(state, "Adding Component")}
        active
        title={Titles.AddComponentNew}
        innerStyle={{ maxHeight: 300, overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual("Adding Component");
        }}
      >
        <TreeViewItemContainer>
          <SelectInput
            options={Object.keys(ComponentTypes.ReactNative).map(v => ({
              title: v,
              id: v,
              value: v
            }))}
            label={Titles.ComponentType}
            onChange={(value: any) => {
              this.setState({ componentType: value });
            }}
            value={this.state.componentType}
          />
        </TreeViewItemContainer>
        {this.state.componentType ? (
          <TreeViewMenu
            title={`${Titles.Add} ${this.state.componentType}`}

            onClick={() => {
              this.props.graphOperation(
                AddComponent({
                  component: currentNode.id,
                  componentType: this.state.componentType
                })
              );
            }}
          />
        ) : null}
      </TreeViewMenu>
    );
  }
}

AddComponentMenu.propTypes = {
  graphOperation: function () {
    return null;
  },
  toggleVisual: function () {
    return null;
  },
  node: function () {
    return null;
  }
};

export default UIConnect(AddComponentMenu);
