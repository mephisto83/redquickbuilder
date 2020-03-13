// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import TextInput from "./textinput";
import SelectInput from "./selectinput";
import FormControl from "./formcontrol";
import MainSideBar from "./mainsidebar";
import * as UIA from "../actions/uiactions";
import TabPane from "./tabpane";
import SideBar from "./sidebar";
import TreeViewMenu from "./treeviewmenu";
import * as Titles from "./titles";
import CheckBox from "./checkbox";
import ControlSideBarMenu, {
  ControlSideBarMenuItem
} from "./controlsidebarmenu";
import {
  NodeProperties,
  NodeTypes,
  LinkEvents,
  LinkType,
  LinkProperties,
  GroupProperties
} from "../constants/nodetypes";
import {
  addValidatator,
  TARGET,
  createEventProp,
  GetNode,
  GetLinkChain,
  GetLinkChainItem,
  createExecutor
} from "../methods/graph_methods";
import SideBarMenu from "./sidebarmenu";
import {
  FunctionTypes,
  FunctionTemplateKeys
} from "../constants/functiontypes";
import { DataChainContextMethods } from "../constants/datachain";

class CurrentNodeProperties extends Component {
  render() {
    var { state } = this.props;

    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    if (!currentNode) {
      return <div />;
    }
    let nodeProperties = currentNode.properties || {};
    return (
      <MainSideBar active={true} relative={true}>
        <SideBar style={{ paddingTop: 0 }}>
          <SideBarMenu>
            <TreeViewMenu
              open={UIA.Visual(state, "CURRENT_NODE_PROPERTIES")}
              active={true}
              title={Titles.Properties}
              innerStyle={{ maxHeight: 600, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual("CURRENT_NODE_PROPERTIES");
              }}
            >
              {Object.keys(nodeProperties)
                .sort()
                .map(key => {
                  return (
                    <TreeViewMenu
                      title={`${key}: ${nodeProperties[key]}`}
                      key={`component-props-${key}`}
                      hideArrow={true}
                      onClick={() => {
                        this.props.graphOperation([
                          {
                            operation: UIA.UPDATE_NODE_DIRTY,
                            options: {
                              id: currentNode.id,
                              prop: key,
                              value: !!!UIA.GetNodePropDirty(currentNode, key)
                            }
                          }
                        ]);
                      }}
                      icon={
                        UIA.GetNodePropDirty(currentNode, key)
                          ? "fa fa-square"
                          : "fa fa-square-o"
                      }
                    />
                  );
                })}
            </TreeViewMenu>
          </SideBarMenu>
        </SideBar>
      </MainSideBar>
    );
  }
}

export default UIConnect(CurrentNodeProperties);
