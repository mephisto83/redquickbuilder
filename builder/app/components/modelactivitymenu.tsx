// @flow
import React, { Component } from "react";
import { clipboard } from "electron";
import { UIConnect } from "../utils/utils";
import ControlSideBarMenu, {
  ControlSideBarMenuItem,
  ControlSideBarMenuHeader
} from "./controlsidebarmenu";
import * as UIA from "../actions/uiactions";
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
import {
  GetSpecificModels,
  GetAllModels,
  CreateLoginModels
} from "../constants/nodepackages";
import TreeViewMenu from "./treeviewmenu";
import CheckBoxProperty from "./checkboxproperty";
import { PARAMETER_TAB } from "./dashboard";

class ModelActivityMenu extends Component<any, any> {
  render() {
    const { state } = this.props;
    const active = UIA.IsCurrentNodeA(state, [UIA.NodeTypes.Model]);
    const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    const is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
    const is_parent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsParent);
    const many_to_many_enabled = UIA.GetNodeProp(
      currentNode,
      UIA.NodeProperties.ManyToManyNexus
    );
    const permission_nodes = UIA.NodesByType(state, UIA.NodeTypes.Permission).map(
      node => ({
        value: node.id,
        title: UIA.GetNodeTitle(node)
      })
    );
    return (
      <SideMenuContainer
        active={active}
        tab={PARAMETER_TAB}
        visual="model-activities"
        title={Titles.ModelActivityMenu}
      >
        <TabPane active={active}>
          {currentNode ? (
            <FormControl>
              <CheckBox
                label={Titles.IsAgent}
                value={
                  currentNode.properties
                    ? currentNode.properties[UIA.NodeProperties.IsAgent]
                    : ""
                }
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.IsAgent,
                    id: currentNode.id,
                    value
                  });
                }}
              />
              {is_agent ? <CheckBoxProperty
                title={Titles.DefaultAgent}
                node={currentNode}
                property={NodeProperties.DefaultAgent} /> : null}
              {is_agent ? (
                <SelectInput
                  label={Titles.UserModel}
                  options={UIA.NodesByType(state, UIA.NodeTypes.Model).map(
                    node => ({
                      value: node.id,
                      title: UIA.GetNodeTitle(node)
                    })
                  )}
                  onChange={(value: any) => {
                    const id = currentNode.id;
                    this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                      target: currentNode.properties[UIA.NodeProperties.UIUser],
                      source: id,
                      linkType: UIA.LinkProperties.UserLink.type
                    });
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                      prop: UIA.NodeProperties.UIUser,
                      id,
                      value
                    });
                    this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                      target: value,
                      source: id,
                      properties: { ...UIA.LinkProperties.UserLink }
                    });
                  }}
                  value={
                    currentNode.properties
                      ? currentNode.properties[UIA.NodeProperties.UIUser]
                      : ""
                  }
                />
              ) : null}
              <CheckBox
                label={Titles.IsUser}
                value={
                  currentNode.properties
                    ? currentNode.properties[UIA.NodeProperties.IsUser]
                    : ""
                }
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.IsUser,
                    id: currentNode.id,
                    value
                  });
                }}
              />
              <CheckBox
                label={Titles.IsOwnedByAgents}
                title={Titles.IsOwnedByAgentsDescriptions}
                value={
                  currentNode.properties
                    ? currentNode.properties[UIA.NodeProperties.IsOwnedByAgents]
                    : ""
                }
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.IsOwnedByAgents,
                    id: currentNode.id,
                    value
                  });
                }}
              />
              <CheckBox
                label={Titles.ManyToManyNexus}
                title={Titles.ManyToManyNexusDescription}
                value={UIA.GetNodeProp(
                  currentNode,
                  UIA.NodeProperties.ManyToManyNexus
                )}
                onChange={(value: any) => {
                  this.props.graphOperation([
                    {
                      operation: UIA.CHANGE_NODE_PROPERTY,
                      options: {
                        prop: UIA.NodeProperties.ManyToManyNexus,
                        id: currentNode.id,
                        value
                      }
                    }
                  ]);
                }}
              />
              <CheckBox
                label={Titles.IsCompositeInput}
                value={UIA.GetNodeProp(
                  currentNode,
                  UIA.NodeProperties.IsCompositeInput
                )}
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.IsCompositeInput,
                    id: currentNode.id,
                    value
                  });
                }}
              />
              <CheckBox
                label={Titles.ExcludeFromController}
                value={UIA.GetNodeProp(
                  currentNode,
                  UIA.NodeProperties.ExcludeFromController
                )}
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.ExcludeFromController,
                    id: currentNode.id,
                    value
                  });
                }}
              />
              <CheckBoxProperty
                node={currentNode}
                property={NodeProperties.IsFetchOutput}
                title={Titles.IsFetchOutput}
              />
              {many_to_many_enabled ? (
                <SelectInput
                  options={UIA.NodesByType(state, NodeTypes.Model).map(x => ({
                    value: x.id,
                    title: UIA.GetNodeTitle(x)
                  }))}
                  label={Titles.ManyToManyNexusModel}
                  onChange={(value: any) => {
                    const id = currentNode.id;
                    const types =
                      UIA.GetNodeProp(
                        currentNode,
                        UIA.NodeProperties.ManyToManyNexusTypes
                      ) || [];
                    this.props.graphOperation([
                      {
                        operation: UIA.CHANGE_NODE_PROPERTY,
                        options: {
                          prop: UIA.NodeProperties.ManyToManyNexusTypes,
                          id: currentNode.id,
                          value: [...types, value].unique(x => x)
                        }
                      },
                      {
                        operation: UIA.ADD_LINK_BETWEEN_NODES,
                        options: {
                          target: value,
                          source: id,
                          properties: { ...UIA.LinkProperties.ManyToManyLink }
                        }
                      }
                    ]);
                  }}
                  value=""
                />
              ) : null}
              {/* ok
                        <ButtonList active={true} tabPaneStyle={{ maxHeight: 200, overflowY: 'scroll' }}
                            items={(getNodeLinks(UIA.GetCurrentGraph(state), currentNode.id) || []).map(t => {
                                let id_ = t.source;
                                if (t.source === currentNode.id) {
                                    id_ = t.target;
                                }
                                return {
                                    title: UIA.GetNodeTitle(id_),
                                    id: t.id
                                }
                            })}
                            isSelected={() => false}
                            onClick={(item) => {
                                // let id = currentNode.id;
                                // var types = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusTypes) || [];
                                // var ids = types;
                                // if (types.some(t => item.id === t)) {
                                //     ids = [...ids.filter(t => t !== item.id)].unique(x => x)
                                // }
                                // else {
                                //     ids = [...ids, item.id].unique(x => x)
                                // }
                                // this.props.graphOperation([{
                                //     operation: UIA.CHANGE_NODE_PROPERTY,
                                //     options: {
                                //         prop: UIA.NodeProperties.ManyToManyNexusTypes,
                                //         id: currentNode.id,
                                //         value: ids
                                //     }
                                // }, {
                                //     operation: UIA.REMOVE_LINK_BETWEEN_NODES,
                                //     options: {
                                //         target: item.id,
                                //         source: id,
                                //         linkType: UIA.LinkProperties.ManyToManyLink.type
                                //     }
                                // }]);
                            }} /> */}
            </FormControl>
          ) : null}

          <ControlSideBarMenuHeader title={Titles.ModelActions} />

          <ControlSideBarMenu>
            <ControlSideBarMenuItem
              onClick={() => {
                this.props.graphOperation(UIA.ADD_DEFAULT_PROPERTIES, {
                  parent: UIA.Visual(state, UIA.SELECTED_NODE),
                  groupProperties: {},
                  linkProperties: {
                    properties: { ...UIA.LinkProperties.PropertyLink }
                  }
                });
              }}
              icon="fa fa-puzzle-piece"
              title={Titles.SetDefaultProperties}
              description={Titles.SetDefaultPropertiesDescription}
            />
            <ControlSideBarMenuItem
              onClick={() => {
                this.props.graphOperation(UIA.NEW_PROPERTY_NODE, {
                  parent: UIA.Visual(state, UIA.SELECTED_NODE),
                  properties: {
                    [NodeProperties.UIAttributeType]: NodePropertyTypes.STRING
                  },
                  groupProperties: {},
                  linkProperties: {
                    properties: { ...UIA.LinkProperties.PropertyLink }
                  }
                });
              }}
              icon="fa fa-puzzle-piece"
              title={Titles.AddProperty}
              description={Titles.AddPropertyDescription}
            />
            <ControlSideBarMenuItem
              onClick={() => {
                clipboard.writeText(UIA.generateDataSeed(currentNode));
              }}
              icon="fa fa-puzzle-piece"
              title={Titles.CreateObjectDataSeed}
              description={Titles.CreateObjectDataSeed}
            />
            <TreeViewMenu
              title={Titles.QuickMethods}
              open={UIA.Visual(state, Titles.QuickMethods)}
              active={UIA.Visual(state, Titles.QuickMethods)}
              toggle={() => {
                this.props.toggleVisual(Titles.QuickMethods);
              }}
              icon="fa fa-tag"
            >
              <TreeViewMenu
                hideArrow
                title={GetSpecificModels.type}
                icon="fa fa-plus"
                onClick={() => {
                  this.props.executeGraphOperation(
                    currentNode,
                    GetSpecificModels
                  );
                }}
              />
              <TreeViewMenu
                hideArrow
                title={GetAllModels.type}
                icon="fa fa-plus"
                onClick={() => {
                  this.props.executeGraphOperation(currentNode, GetAllModels);
                }}
              />
              <TreeViewMenu
                hideArrow
                title={CreateLoginModels.type}
                icon="fa fa-plus"
                onClick={() => {
                  this.props.executeGraphOperation(
                    currentNode,
                    CreateLoginModels
                  );
                }}
              />
            </TreeViewMenu>
          </ControlSideBarMenu>
          {is_agent ? (
            <SelectInput
              label={Titles.PermissionType}
              options={permission_nodes}
              onChange={(value: any) => {
                const id = currentNode.id;
                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                  target: value,
                  source: id,
                  properties: { ...UIA.LinkProperties.PermissionLink }
                });
              }}
              value={
                currentNode.properties
                  ? currentNode.properties[UIA.NodeProperties.UIPermissions]
                  : ""
              }
            />
          ) : null}
          {currentNode ? (
            <FormControl>
              <CheckBox
                label={Titles.IsParent}
                value={
                  currentNode.properties
                    ? currentNode.properties[UIA.NodeProperties.IsParent]
                    : ""
                }
                onChange={(value: any) => {
                  this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                    prop: UIA.NodeProperties.IsParent,
                    id: currentNode.id,
                    value
                  });
                }}
              />
            </FormControl>
          ) : null}
          {is_parent ? (
            <SelectInput
              label={Titles.ParentTo}
              options={UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => ({
                value: node.id,
                title: UIA.GetNodeTitle(node)
              }))}
              onChange={(value: any) => {
                const id = currentNode.id;
                this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                  target:
                    currentNode.properties[UIA.NodeProperties.UIChoiceNode],
                  source: id,
                  linkType: UIA.LinkProperties.ParentLink.type
                });
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.UIChoiceNode,
                  id,
                  value
                });
                this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                  target: value,
                  source: id,
                  properties: { ...UIA.LinkProperties.ParentLink }
                });
              }}
              value={
                currentNode.properties
                  ? currentNode.properties[UIA.NodeProperties.UIChoiceNode]
                  : ""
              }
            />
          ) : null}
          <ControlSideBarMenu>
            {is_agent ? (
              <ControlSideBarMenuItem
                onClick={() => {
                  this.props.graphOperation(UIA.NEW_PERMISSION_NODE, {
                    parent: UIA.Visual(state, UIA.SELECTED_NODE),
                    linkProperties: {
                      properties: { ...UIA.LinkProperties.PermissionLink }
                    }
                  });
                }}
                icon="fa fa-puzzle-piece"
                title={Titles.AddPermission}
                description={Titles.AddPermissionDescription}
              />
            ) : null}
          </ControlSideBarMenu>
        </TabPane>
      </SideMenuContainer>
    );
  }
}

export default UIConnect(ModelActivityMenu);
