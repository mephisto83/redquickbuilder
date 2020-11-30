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
  CODE_VIEW
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
import { PERMISSION, FILTER, VALIDATION } from "../constants/condition";
import { DataChainContextMethods } from "../constants/datachain";
const CONDITION_FILTER_MENU_PARAMETER = "condition-filter-menu-parameter";
const DATA_SOURCE = "DATA_SOURCE";
class ConditionContextMenu extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  render() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? "block" : "none";
    let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE)
      ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
      : null;
    let menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    };
    let { models, interestingNode } = this.getModels();
    if (!interestingNode || !models) {
      return <div />;
    }
    let methodFunctionValidation = UIA.GetNodeProp(
      currentNode,
      NodeProperties.Condition
    ); // UIA.GetMethodFunctionValidation(permissionNode.id);
    let methodFunctionType = UIA.GetMethodFunctionType(interestingNode.id);
    let param_list_key = `${currentNode.id} ${methodFunctionType}`;
    let selectedParameter = UIA.Visual(state, param_list_key);
    return (
      <TreeViewMenu
        open={this.state.opened}
        active={true}
        title={Titles.Condition}
        toggle={() => {
          this.setState({ opened: !this.state.opened });
        }}
      >
        <SideBarHeader title={"Parameters"} />
        <ButtonList
          active={true}
          isSelected={item => {
            return item && selectedParameter === item.id;
          }}
          items={models}
          onClick={item => {
            let methodValidationForParameter = addMethodValidationForParamter(
              methodFunctionValidation,
              methodFunctionType,
              item.id
            );
            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
              prop: UIA.NodeProperties.Condition,
              id: currentNode.id,
              value: methodValidationForParameter
            });
            this.props.setVisual(param_list_key, item.id);
          }}
        />
      </TreeViewMenu>
    );
  }
  getModels() {
    var { state } = this.props;
    let methodDefinition;
    let methodProps;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let methodDefinitionKey = this.props.methodDefinitionKey;
    let interestingNode;
    if (currentNode) {
      switch (methodDefinitionKey) {
        case PERMISSION:
          interestingNode = UIA.GetPermissionNode(currentNode.id);
          break;
        case FILTER:
          interestingNode = UIA.GetModelItemFilter(currentNode.id);
          break;
        case VALIDATION:
          interestingNode = UIA.GetValidationNode(currentNode.id);
          break;
        default:
          interestingNode = UIA.GetPermissionNode(currentNode.id);
          if (interestingNode) {
            methodDefinitionKey = PERMISSION;
          } else {
            interestingNode = UIA.GetModelItemFilter(currentNode.id);
            if (interestingNode) {
              methodDefinitionKey = FILTER;
            } else {
              interestingNode = UIA.GetValidationNode(currentNode.id);
              if (interestingNode) {
                methodDefinitionKey = VALIDATION;
              }
            }
          }
          break;
      }
      if (interestingNode) {
        methodDefinition = interestingNode
          ? UIA.GetMethodDefinition(interestingNode.id)
          : null;
        methodProps = UIA.GetMethodsProperties(interestingNode.id);
      }
    }
    if (
      methodDefinition &&
      methodDefinition[methodDefinitionKey] &&
      methodDefinition[methodDefinitionKey].params &&
      methodDefinition[methodDefinitionKey].params.length
    ) {
    } else if (this.props.view && currentNode) {
      interestingNode = UIA.GetDataSourceNode(currentNode.id);
      if (!interestingNode) {
        return {};
      }
      methodProps = {
        [DATA_SOURCE]: UIA.GetNodeProp(
          interestingNode,
          NodeProperties.UIModelType
        )
      };
    } else {
      return {};
    }
    let filterParameters = UIA.GetMethodPermissionParameters(
      interestingNode.id,
      true
    );

    let id = currentNode.id;
    let models = [];
    if (methodDefinition) {
      models = methodDefinition[methodDefinitionKey].params
        .map(t => {
          if (typeof t === "object") {
            return t.key;
          }
          return t;
        })
        .map(t => {
          return {
            title: `${UIA.GetNodeTitle(methodProps[t])} (${t})`,
            value: t,
            id: t
          };
        });
    } else if (this.props.view) {
      models = UIA.GetModelNodes().toNodeSelect();
    }

    return {
      models,
      methodProps,
      interestingNode
    };
  }
}

export default UIConnect(ConditionContextMenu);
