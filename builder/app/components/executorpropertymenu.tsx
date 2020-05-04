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
  ExecutorRules,
  ExecutorUI
} from "../constants/nodetypes";
import {
  getNodesByLinkType,
  SOURCE,
  createValidator,
  addValidatator,
  TARGET,
  createEventProp,
  GetNode,
  createExecutor
} from "../methods/graph_methods";
import SideBarMenu from "./sidebarmenu";
import { exec } from "child_process";
import { uuidv4 } from "../utils/array";

class ExecutorPropertyMenu extends Component<any, any> {
  render() {
    var { state } = this.props;
    var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Executor);
    var graph = UIA.GetCurrentGraph(state);
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    var executor;
    if (
      currentNode &&
      UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)
    ) {
      // var propertyNodes = getNodesByLinkType(graph, {
      //     id: UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel),
      //     direction: SOURCE,
      //     type: LinkType.PropertyLink
      // }).filter(x => UIA.GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.Model).toNodeSelect();
      var propertyNodes = UIA.GetModelPropertyChildren(
        UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)
      ).toNodeSelect();
      executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor);
    }
    let addProperty = values => {
      let executor =
        UIA.GetNodeProp(currentNode, NodeProperties.Executor) ||
        createExecutor();
      var operation = values
        .map(value => {
          var id = currentNode.id;
          executor = addValidatator(executor, { id: value });

          return [
            {
              operation: UIA.CHANGE_NODE_PROPERTY,
              options: function() {
                return {
                  id: currentNode.id,
                  prop: NodeProperties.Executor,
                  value: executor,
                  callback: _updatedExecutor => {
                    executor = _updatedExecutor;
                  }
                };
              }
            },
            {
              operation: UIA.ADD_LINK_BETWEEN_NODES,
              options: function() {
                return {
                  target: value,
                  source: id,
                  properties: {
                    ...UIA.LinkProperties.ExecutorModelLink,
                    ...createEventProp(LinkEvents.Remove, {
                      function: "OnRemoveExecutorPropConnection"
                    })
                  }
                };
              }
            }
          ];
        })
        .flatten();
      this.props.graphOperation(operation);
    };
    return (
      <TabPane active={active}>
        {currentNode ? (
          <FormControl>
            <div className="btn-group">
              <button
                onClick={() => {
                  addProperty(
                    propertyNodes
                      .filter(
                        x =>
                          !UIA.GetNodeProp(
                            x.value,
                            NodeProperties.IsDefaultProperty
                          )
                      )
                      .map(t => {
                        return t.value;
                      })
                  );
                }}
                type="button"
                title={Titles.AddAllProperties}
                className="btn btn-default btn-flat"
              >
                <i className="fa fa-cube" />
              </button>
              <button
                onClick={() => {
                  if (executor && executor.properties) {
                    Object.keys(executor.properties).map(key => {
                      executor = addValidatator(executor, {
                        id: key,
                        validator: uuidv4(),
                        validatorArgs: {
                          type: ExecutorRules.Copy,
                          ...ExecutorUI[ExecutorRules.Copy]
                        }
                      });
                    });
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                      id: currentNode.id,
                      prop: this.props.nodeProp || NodeProperties.Executor,
                      value: executor
                    });
                  }
                }}
                type="button"
                title={Titles.ApplyCopyToAllProperties}
                className="btn btn-default btn-flat"
              >
                <i className="fa  fa-copy" />
              </button>
            </div>
            <SelectInput
              options={propertyNodes}
              defaultSelectText={Titles.SelectProperty}
              label={Titles.Property}
              onChange={v => addProperty([v])}
              value={
                currentNode.properties
                  ? currentNode.properties[UIA.NodeProperties.ExecutorModel]
                  : ""
              }
            />
          </FormControl>
        ) : null}
      </TabPane>
    );
  }
}

export default UIConnect(ExecutorPropertyMenu);
