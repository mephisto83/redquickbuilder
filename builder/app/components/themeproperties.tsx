// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import MainSideBar from "./mainsidebar";
import * as UIA from "../actions/uiactions";
import SideBar from "./sidebar";
import TreeViewMenu from "./treeviewmenu";
import * as Titles from "./titles";
import {
  NodeProperties,
  NodeTypes
} from "../constants/nodetypes";
import SideBarMenu from "./sidebarmenu";
import { Themes } from "../constants/themes";
import TreeViewItemContainer from "./treeviewitemcontainer";
import SelectInput from "./selectinput";

class ThemeProperties extends Component {
  render() {
    const { state } = this.props;

    const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    if (!currentNode || !UIA.IsCurrentNodeA(state, NodeTypes.Theme)) {
      return <div />;
    }

    const nodeProperties = UIA.GetNodeProp(currentNode, NodeProperties.Themes) || {};
    return (
      <MainSideBar active relative>
        <SideBar style={{ paddingTop: 0 }}>
          <SideBarMenu>
            <TreeViewMenu
              open={UIA.Visual(state, "them_properties")}
              active
              title={Titles.Themes}
              innerStyle={{ maxHeight: 600, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual("them_properties");
              }}
            >
              {Object.keys(Themes)
                .sort()
                .map(key => (
                  <TreeViewMenu
                    title={`${key}`}
                    key={`theme-props-${key}`}
                    onClick={() => {
                      this.props.graphOperation([
                        {
                          operation: UIA.UPDATE_NODE_PROPERTY,
                          options: {
                            id: currentNode.id,
                            properties: {
                              [NodeProperties.Themes]: {
                                ...nodeProperties,
                                [key]: !!!nodeProperties[key]
                              }
                            }
                          }
                        }
                      ]);
                    }}
                    icon={
                      nodeProperties[key]
                        ? "fa fa-square"
                        : "fa fa-square-o"
                    }
                  />
                ))}
            </TreeViewMenu>
            <TreeViewMenu
              open={UIA.Visual(state, `details`)}
              active
              title={Titles.Details}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual(`details`);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  options={[].interpolate(0, 10, x => x).map(x => ({
                    id: x,
                    value: x,
                    title: x
                  }))}
                  label={Titles.Priority}
                  onChange={value => {
                    this.props.graphOperation([
                      {
                        operation: UIA.UPDATE_NODE_PROPERTY,
                        options() {
                          return {
                            id: currentNode.id,
                            properties: {
                              [NodeProperties.Priority]: value
                            }
                          };
                        }
                      }
                    ]);
                  }}
                  value={UIA.GetNodeProp(
                    currentNode,
                    NodeProperties.Priority
                  )}
                />
              </TreeViewItemContainer>
            </TreeViewMenu>
          </SideBarMenu>
        </SideBar>
      </MainSideBar>
    );
  }
}

export default UIConnect(ThemeProperties);
