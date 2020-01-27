// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import ControlSideBarMenu, {
  ControlSideBarMenuItem,
  ControlSideBarMenuHeader
} from "./controlsidebarmenu";
import * as UIA from "../actions/uiactions";
import TabPane from "./tabpane";
import SideBarHeader from "./sidebarheader";
import * as Titles from "./titles";
import {
  LinkType,
  NodeProperties,
  NodeTypes,
  FilterUI
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
  ConditionTypeParameters,
  bindTemplate,
  FunctionTemplateKeys
} from "../constants/functiontypes";
import CheckBox from "./checkbox";
import GenericPropertyMenu from "./genericpropertymenu";
import GenericPropertyContainer from "./genericpropertycontainer";
import TextInput from "./textinput";
import ButtonList from "./buttonlist";
import SideBarMenu from "./sidebarmenu";
import TreeViewMenu from "./treeviewmenu";
import { PERMISSION, FILTER, VALIDATION } from "../constants/condition";
import { debug } from "util";
import { uuidv4 } from "../utils/array";
import { combineReducers } from "redux";
const CONDITION_FILTER_MENU_PARAMETER = "condition-filter-menu-parameter";
const CONDITION_FILTER_MENU_PARAMETER_PROPERTIES =
  "condition-filter-menu-parameter-properties";
const DATA_SOURCE = "DATA_SOURCE";
class ConditionFilterMenu extends Component {
  render() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let methodProps;
    let methodDefinition;
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
        return <div />;
      }
      methodProps = {
        [DATA_SOURCE]: UIA.GetNodeProp(
          interestingNode,
          NodeProperties.UIModelType
        )
      };
    } else {
      return <div />;
    }
    let filterParameters = UIA.GetMethodPermissionParameters(
      interestingNode.id,
      true
    );
    if (currentNode) {
      switch (methodDefinitionKey) {
        case PERMISSION:
          break;
        case FILTER:
          filterParameters = UIA.GetMethodFilterParameters(
            interestingNode.id,
            true
          );
          break;
        case VALIDATION:
          filterParameters = UIA.GetMethodValidationParameters(
            interestingNode.id,
            true
          );
          break;
      }
    }
    let id = currentNode.id;
    let models = [];
    if (methodDefinition) {
      let mdparams = methodDefinition[methodDefinitionKey].params;
      models = mdparams
        .map(t => {
          if (typeof t === "object") {
            return t.key;
          }
          return t;
        })
        .map((t, t_index) => {
          if (mdparams[t_index] && mdparams[t_index].changeparameter) {
            let mdprops = {};
            mdparams
              .filter(x => typeof x === "string")
              .map(x => {
                mdprops[x] = UIA.GetNodeTitle(methodProps[x]);
              });
            return {
              title: bindTemplate(mdparams[t_index].template, mdprops),
              value: t,
              id: t
            };
          }
          return {
            title: `${UIA.GetNodeTitle(methodProps[t])} (${t})`,
            value: t,
            id: t
          };
        });
    } else if (this.props.view) {
      models = UIA.GetModelNodes().toNodeSelect();
    }
    let methodFunctionType = this.props.view
      ? DATA_SOURCE
      : UIA.GetMethodFunctionType(interestingNode.id);
    let methodFunctionValidation = UIA.GetNodeProp(
      currentNode,
      NodeProperties.Condition
    ); // UIA.GetMethodFunctionValidation(permissionNode.id);
    let param_list_key = `${currentNode.id} ${methodFunctionType}`;
    let param = UIA.Visual(state, param_list_key);
    let param_property_list_key = UIA.Visual(state, param_list_key)
      ? `${param_list_key} ${param}`
      : null;
    let selectedParameter = UIA.Visual(state, param_list_key);

    let model_properties = [];
    if (FunctionTemplateKeys.ChangeParameter === param) {
      let cp_params = methodDefinition[methodDefinitionKey].params;
      let cp = cp_params.find(
        x => x && x.key === FunctionTemplateKeys.ChangeParameter
      );
      if (cp) {
        model_properties = UIA.GetModelPropertyChildren(
          this.props.view ? param : methodProps[cp_params[0]]
        ).toNodeSelect();
      }
    } else {
      model_properties = UIA.GetModelPropertyChildren(
        this.props.view ? param : methodProps[param]
      ).toNodeSelect();
    }
    let top = this.getTop({
      model_properties,
      methodProps,
      selectedParameter,
      filterMenuParameter: `${
        currentNode.id
      }${CONDITION_FILTER_MENU_PARAMETER}`,
      filterMenuParameterProperties: `${
        currentNode.id
      } ${CONDITION_FILTER_MENU_PARAMETER_PROPERTIES}`,
      param_list_key,
      methodFunctionValidation,
      models,
      methodFunctionType,
      param_property_list_key
    });

    let methodParamSetup = getMethodValidationForParameter(
      methodFunctionValidation,
      methodFunctionType,
      UIA.Visual(state, param_list_key),
      UIA.Visual(state, param_property_list_key)
    );

    let updateValidation = () => {
      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
        prop: UIA.NodeProperties.Condition,
        id: currentNode.id,
        value: methodFunctionValidation
      });
    };
    let onCopy = (prop, key) => {
      let copyValue = null;
      if (
        methodFunctionValidation &&
        methodFunctionValidation.methods &&
        methodFunctionValidation.methods[methodFunctionType] &&
        methodFunctionValidation.methods[methodFunctionType][
          selectedParameter
        ] &&
        methodFunctionValidation.methods[methodFunctionType][selectedParameter]
          .properties
      ) {
        copyValue =
          methodFunctionValidation.methods[methodFunctionType][
            selectedParameter
          ].properties[prop];
        if (copyValue && copyValue.validators && copyValue.validators[key]) {
          copyValue = copyValue.validators[key];

          copyValue = {
            value: JSON.parse(JSON.stringify(copyValue)),
            isAll: false,
            isPart: true
          };
        } else {
          copyValue = {
            value: JSON.parse(JSON.stringify(copyValue)),
            isAll: true,
            isPart: false
          };
        }
      }

      if (copyValue) {
        this.props.setVisual(UIA.CopyKey(methodDefinitionKey), copyValue);
      }
    };
    let copyKey = UIA.Visual(state, UIA.CopyKey(methodDefinitionKey));
    let onPaste = (prop, key) => {
      if (copyKey) {
        if (copyKey.value && copyKey.isAll && prop) {
          if (
            methodFunctionValidation &&
            methodFunctionValidation.methods &&
            methodFunctionValidation.methods[methodFunctionType] &&
            methodFunctionValidation.methods[methodFunctionType][
              selectedParameter
            ] &&
            methodFunctionValidation.methods[methodFunctionType][
              selectedParameter
            ].properties &&
            methodFunctionValidation.methods[methodFunctionType][
              selectedParameter
            ].properties[prop]
          ) {
            if (copyKey.value && copyKey.value.validators) {
              let updatableObject =
                methodFunctionValidation.methods[methodFunctionType][
                  selectedParameter
                ].properties[prop].validators;
              Object.values(copyKey.value.validators).map(copyValue => {
                updatableObject[uuidv4()] = copyValue;
              });
            }
            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
              prop: UIA.NodeProperties.Condition,
              id: currentNode.id,
              value: methodFunctionValidation
            });
          }
        } else if (copyKey.isPart && prop && key) {
          debugger;
        }
      }
    };
    let onRemoveValidation = remove => {
      if (remove) {
        methodFunctionValidation = removeMethodValidationParameter(
          methodFunctionValidation,
          methodFunctionType,
          UIA.Visual(state, param_list_key),
          remove
        );
      }
      updateValidation();
    };
    return (
      <GenericPropertyContainer
        title="asdf"
        subTitle="afaf"
        nodeType={NodeTypes.Condition}
        top={top}
      >
        <GenericPropertyMenu
          ui={FilterUI}
          function_variables={filterParameters}
          methodParamSetup={methodParamSetup}
          nodeType={NodeTypes.Condition}
          onRemove={onRemoveValidation}
          onCopy={onCopy}
          onPaste={onPaste}
          pasteAll={copyKey && copyKey.isAll}
          pastePart={copyKey && copyKey.isPart}
          adjacentNodeId={interestingNode.id}
          onChange={updateValidation}
          onAdd={updateValidation}
        />
      </GenericPropertyContainer>
    );
  }
  getTop(args = {}) {
    let {
      methodProps,
      model_properties,
      models,
      selectedParameter,
      filterMenuParameter = CONDITION_FILTER_MENU_PARAMETER,
      filterMenuParameterProperties = CONDITION_FILTER_MENU_PARAMETER_PROPERTIES,
      param_list_key,
      methodFunctionValidation,
      methodFunctionType,
      param_property_list_key
    } = args;

    let { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    return (
      <SideBarMenu relative={true}>
        <TreeViewMenu
          open={UIA.Visual(state, filterMenuParameter)}
          active={UIA.Visual(state, filterMenuParameter)}
          title={
            `${UIA.GetNodeTitle(
              methodProps[selectedParameter]
            )} (${selectedParameter})` || "Parameters"
          }
          toggle={() => {
            this.props.toggleVisual(filterMenuParameter);
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
        <TreeViewMenu
          open={UIA.Visual(state, filterMenuParameterProperties)}
          active={UIA.Visual(state, filterMenuParameterProperties)}
          title={
            UIA.GetNodeTitle(UIA.Visual(state, param_property_list_key)) ||
            "Parameter Properties"
          }
          toggle={() => {
            this.props.toggleVisual(filterMenuParameterProperties);
          }}
        >
          <SideBarHeader title={"Parameter Properties"} />
          {param_property_list_key ? (
            <ButtonList
              active={true}
              isSelected={item => {
                return (
                  item && UIA.Visual(state, param_property_list_key) === item.id
                );
              }}
              items={model_properties}
              onClick={item => {
                let methodValidationForParameter = addMethodValidationForParamter(
                  methodFunctionValidation,
                  methodFunctionType,
                  UIA.Visual(state, param_list_key),
                  item.id
                );
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.Condition,
                  id: currentNode.id,
                  value: methodValidationForParameter
                });
                this.props.setVisual(param_property_list_key, item.id);
              }}
            />
          ) : null}
        </TreeViewMenu>
      </SideBarMenu>
    );
  }
}

export default UIConnect(ConditionFilterMenu);
