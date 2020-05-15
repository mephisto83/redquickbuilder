// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import TabPane from "./tabpane";
import * as Titles from "./titles";
import { NodeProperties } from "../constants/nodetypes";
import SideMenuContainer from "./sidemenucontainer";
import { SCOPE_TAB } from "./dashboard";
import CheckBoxProperty from "./checkboxproperty";
class ComponentAPIMenu extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  render() {
    var { state } = this.props;
    var active = [UIA.NodeTypes.ComponentNode, UIA.NodeTypes.ScreenOption].some(
      v => v === UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType)
    );
    if (!active) {
      return <div />;
    }
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

    return (
      <SideMenuContainer
        active={active}
        tab={SCOPE_TAB}
        visual={"component-api-menu"}
        title={Titles.ComponentAPIMenu}
      >
        <TabPane active={active}>
          <CheckBoxProperty
            title={Titles.ExecuteButton}
            property={NodeProperties.ExecuteButton}
            node={currentNode}
          />
        </TabPane>
      </SideMenuContainer>
    );
  }
}

export default UIConnect(ComponentAPIMenu);
