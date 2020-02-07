// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import TabPane from "./tabpane";
import SideMenuContainer from "./sidemenucontainer";
import * as Titles from "./titles";
import CheckBoxProperty from "./checkboxproperty";
import { NodeProperties, NodeTypes } from "../constants/nodetypes";
import FormControl from "./formcontrol";
import SideBar from "./sidebar";
import SideBarMenu from "./sidebarmenu";
import SideBarContent from "./sidebarcontent";
import { StyleLib } from "../constants/styles";
import TextInput from "./textinput";
import TreeViewItemContainer from "./treeviewitemcontainer";
import TreeViewMenu from "./treeviewmenu";
import GenericPropertyContainer from "./genericpropertycontainer";

class StyleMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    var { state } = this.props;
    var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Style);
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    if (!currentNode || !active) {
      return <TabPane active={active} />;
    }
    let cellStyle = UIA.GetNodeProp(currentNode, NodeProperties.Style) || {};
    return (
      <SideBarMenu relative={true}>
        <GenericPropertyContainer
          active={true}
          title="asdf"
          subTitle="afaf"
          nodeType={NodeTypes.Selector}
        >
          <TreeViewMenu
            open={UIA.Visual(state, Titles.Selector)}
            active={true}
            title={Titles.Selector}
            toggle={() => {
              this.props.toggleVisual(Titles.Selector);
            }}
          >
            {[
              NodeProperties.ActiveStyle,
              NodeProperties.CheckedStyle,
              NodeProperties.DisabledStyle,
              NodeProperties.EmptyStyle,
              NodeProperties.EnabledStyle,
              NodeProperties.FirstChildStyle,
              NodeProperties.LastChildStyle,
              NodeProperties.FocusStyle,
              NodeProperties.ReadOnlyStyle,
              NodeProperties.BeforeStyle,
              NodeProperties.AfterStyle
            ].map(x => {
              return (
                <TreeViewItemContainer key={x}>
                  <CheckBoxProperty
                    title={x}
                    node={currentNode}
                    property={x}
                  />
                </TreeViewItemContainer>
              );
            })}
          </TreeViewMenu>
        </GenericPropertyContainer>
        <GenericPropertyContainer
          active={true}
          title="asdf"
          subTitle="afaf"
          nodeType={NodeTypes.Style}
        >
          <TreeViewMenu
            open={UIA.Visual(state, Titles.Style)}
            active={true}
            title={Titles.Style}
            toggle={() => {
              this.props.toggleVisual(Titles.Style);
            }}
          >
            <TreeViewItemContainer>
              <FormControl>
                <TextInput
                  value={this.state.filter}
                  label={Titles.Filter}
                  immediate={true}
                  onChange={value => {
                    this.setState({ filter: value });
                  }}
                  placeholder={Titles.Filter}
                />
                {this.getStyleSelect()}
                {cellStyle && currentNode
                  ? this.selectedStyle(value => {
                      cellStyle[this.state.selectedStyleKey] = value;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Style,
                        id: currentNode.id,
                        value: cellStyle
                      });
                    }, cellStyle[this.state.selectedStyleKey])
                  : null}
                {cellStyle ? this.getCurrentStyling(cellStyle) : null}
              </FormControl>
            </TreeViewItemContainer>
          </TreeViewMenu>
        </GenericPropertyContainer>
      </SideBarMenu>
    );
  }
  selectedStyle(callback, value) {
    if (this.state.selectedStyleKey) {
      switch (this.state.selectedStyleKey) {
        default:
          return (
            <TextInput
              value={value}
              label={this.state.selectedStyleKey}
              immediate={true}
              onChange={callback}
              placeholder={Titles.Filter}
            />
          );
      }
    }
    return null;
  }
  getStyleSelect() {
    if (this.state.filter) {
      return (
        <ul style={{ padding: 2, maxHeight: 200, overflowY: "auto" }}>
          {Object.keys(StyleLib.js)
            .filter(x => x.indexOf(this.state.filter) !== -1)
            .map(key => {
              return (
                <li
                  className={"treeview"}
                  style={{ padding: 3, cursor: "pointer" }}
                  label={"Style"}
                  key={key}
                  onClick={() => {
                    this.setState({ selectedStyleKey: key, filter: "" });
                  }}
                >
                  {key}
                </li>
              );
            })}
        </ul>
      );
    }
    return [];
  }
  getCurrentStyling(currentStyle) {
    if (currentStyle) {
      return (
        <ul style={{ padding: 2, maxHeight: 200, overflowY: "auto" }}>
          {Object.keys(currentStyle).map(key => {
            return (
              <li
                className={"treeview"}
                style={{ padding: 3, cursor: "pointer" }}
                key={key}
                onClick={() => {
                  this.setState({ selectedStyleKey: key, filter: "" });
                }}
              >
                [{key}]: {currentStyle[key]}
              </li>
            );
          })}
        </ul>
      );
    }
    return [];
  }
}

export default UIConnect(StyleMenu);
