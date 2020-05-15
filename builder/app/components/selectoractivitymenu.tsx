// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import TabPane from "./tabpane";
import SelectProperty from "./selectproperty";
import TextProperty from './textproperty';
import * as Titles from "./titles";
import {
  NodeTypes,
  LinkProperties,
  NodeProperties,
  SelectorType
} from "../constants/nodetypes";
import { Iterator } from "webcola";
import { ServiceTypes, ServiceTypeSetups } from "../constants/servicetypes";
import { InstanceTypes } from "../constants/componenttypes";
class SelectorActivityMenu extends Component<any, any> {
  render() {
    var { state } = this.props;
    var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Selector);
    if (!active) {
			return <div />;
    }

    var currentNode = active
      ? UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE))
      : null;

    let componentNodeProperties = active
      ? UIA.GetComponentNodeProperties()
      : null;

    return (
      <TabPane active={active}>
        <SelectProperty
          title={Titles.SelectorType}
          options={Object.keys(SelectorType).map(v => ({
              title: v,
              id: v,
              value: v
            }))}
          node={currentNode}
          property={NodeProperties.SelectorType}
        />
        <TextProperty
          title={Titles.DefaultViewModel}
          label={Titles.DefaultViewModel}
          node={currentNode}
          property={NodeProperties.DefaultViewModel}
        />
      </TabPane>
    );
  }
}

export default UIConnect(SelectorActivityMenu);
