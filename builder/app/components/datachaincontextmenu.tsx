// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import ControlSideBarMenu, {
  ControlSideBarMenuItem,
  ControlSideBarMenuHeader
} from "./controlsidebarmenu";
import * as UIA from "../actions/uiActions";
import TabPane from "./tabpane";
import SideBarHeader from "./sidebarheader";
import * as Titles from "./titles";
import {
  LinkType,
  NodeProperties,
  NodeTypes,
  FilterUI,
  LAYOUT_VIEW,
  MAIN_CONTENT,
  MIND_MAP,
  CODE_VIEW,
  LinkProperties
} from "../constants/nodetypes";
import SelectInput from "./selectinput";
import FormControl from "./formcontrol";
import Box from "./box";
import {
  TARGET,
  GetLinkChain,
  SOURCE,
  GetNode,
  createExecutor,
  addMethodValidationForParamter,
  getMethodValidationForParameter,
  createValidator,
  removeMethodValidationParameter
} from "../methods/graph_methods";
import {
  ConditionTypes,
  ConditionFunctionSetups,
  ConditionTypeOptions,
  ConditionTypeParameters
} from "../constants/functiontypes";
import CheckBox from "./checkbox";
import GenericPropertyMenu from "./genericpropertymenu";
import GenericPropertyContainer from "./genericpropertycontainer";
import TextInput from "./textinput";
import ButtonList from "./buttonlist";
import SideBarMenu from "./sidebarmenu";
import TreeViewMenu from "./treeviewmenu";
import SelectProperty from './selectproperty'
import { PERMISSION, FILTER, VALIDATION } from "../constants/condition";
import { DataChainContextMethods } from "../constants/datachain";
import TreeViewItemContainer from "./treeviewitemcontainer";
const CONDITION_FILTER_MENU_PARAMETER = "condition-filter-menu-parameter";
const DATA_SOURCE = "DATA_SOURCE";
class DataChainContextMenu extends Component<any, any> {
  render() {
    var { state } = this.props;
    let display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? "block" : "none";
    if (display === 'none')
      return <div></div>

    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE)
      ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
      : null;
    let menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    };
    return (
      <TreeViewMenu
        active={true}
        title={Titles.DataChain}
        open={UIA.Visual(state, `datachaincontextmenu`)}
        toggle={() => {
          this.props.toggleVisual(`datachaincontextmenu`);
        }}
      >
        <TreeViewMenu
          title={Titles.SplitDataChain}
          hideArrow={true}
          icon={"fa  fa-share-alt"}
          key={"split-data-chain"}
          onClick={() => {
            DataChainContextMethods.SplitDataChain.bind(this)(currentNode);
            exit();
          }}
        />
        <TreeViewMenu
          title={Titles.Snip}
          hideArrow={true}
          icon={"fa fa-taxi"}
          key={"mindmap"}
          onClick={() => {
            DataChainContextMethods.SnipDataChain.bind(this)(currentNode);
            exit();
          }}
        />
        <TreeViewItemContainer>
          <SelectProperty
            title={Titles.DataChainCollection}
            link={LinkProperties.DataChainCollection}
            options={UIA.NodesByType(
              this.props.state,
              NodeTypes.DataChainCollection
            ).toNodeSelect()}
            node={currentNode}
            property={NodeProperties.DataChainCollection}
          />
        </TreeViewItemContainer>
      </TreeViewMenu>
    );
  }
}

export default UIConnect(DataChainContextMenu);
