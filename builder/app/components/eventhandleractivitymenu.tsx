// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import ControlSideBarMenu, {
  ControlSideBarMenuItem,
  ControlSideBarMenuHeader
} from "./controlsidebarmenu";
import * as UIA from "../actions/uiActions";
import TabPane from "./tabpane";
import * as Titles from "./titles";
import FormControl from "./formcontrol";
import CheckBox from "./checkbox";
import SelectInput from "./selectinput";
import ButtonList from "./buttonlist";
import TextBox from "./textinput";
import SideMenuContainer from "./sidemenucontainer";
import {
  NodeTypes,
  NodeProperties,
  NodePropertyTypes
} from "../constants/nodetypes";
import { GetNode, getNodeLinks } from "../methods/graph_methods";
import { clipboard } from "electron";
import {
  GetSpecificModels,
  GetAllModels,
  CreateLoginModels
} from "../constants/nodepackages";
import TreeViewMenu from "./treeviewmenu";
import { PARAMETER_TAB } from "./dashboard";
import { ComponentEvents } from "../constants/componenttypes";
import CheckBoxProperty from "./checkboxproperty";

class EventHandlerActivityMenu extends Component<any, any> {
  render() {
    var { state } = this.props;
    var active = UIA.IsCurrentNodeA(state, [UIA.NodeTypes.EventHandler]);
    if (!active) {
      return <div />;
    }
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    return (
      <SideMenuContainer
        active={active}
        tab={PARAMETER_TAB}
        visual={"event-handler"}
        title={Titles.EventHandlerActivityMenu}
      >
        <TabPane active={active}>
          {currentNode ? (
            <FormControl>
              <SelectInput
                label={Titles.EventType}
                options={Object.keys(ComponentEvents).map(val => {
                  return {
                    value: ComponentEvents[val],
                    title: val
                  };
                })}
                onChange={(value: any) => {
                  var id = currentNode.id;
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.EventType,
                    id,
                    value
                  });
                }}
                value={UIA.GetNodeProp(
                  currentNode,
                  UIA.NodeProperties.EventType
                )}
              />
              <CheckBoxProperty title={Titles.UseValue} property={UIA.NodeProperties.UseValue} node={currentNode} />
            </FormControl>
          ) : null}
        </TabPane>
      </SideMenuContainer>
    );
  }
}

export default UIConnect(EventHandlerActivityMenu);
