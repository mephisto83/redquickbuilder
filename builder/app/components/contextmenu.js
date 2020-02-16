// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import Draggable from "react-draggable"; // The default
import * as Titles from "./titles";
import {
  LinkType,
  NodeProperties,
  NodeTypes,
  LAYOUT_VIEW,
  MAIN_CONTENT,
  MIND_MAP,
  CODE_VIEW,
  UITypes,
  LinkProperties,
  LinkPropertyKeys,
  SelectorType
} from "../constants/nodetypes";
import AddNameDescription from "../nodepacks/AddNameDescription";
import TinyTweaks from "../nodepacks/TinyTweaks";
import BasicApplicationLayout from "../nodepacks/BasicApplicationLayout";
import BasicDoubleSideColumn from "../nodepacks/BasicDoubleSideColumn";
import GenericPropertyContainer from "./genericpropertycontainer";
import ModelContextMenu from "./modelcontextmenu";
import ComponentNodeMenu from "./componentnodemenu";
import ConditionContextMenu from "./conditioncontextmenu";
import TreeViewMenu from "./treeviewmenu";
import DataChainContextMenu from "./datachaincontextmenu";
import TreeViewGroupButton from "./treeviewgroupbutton";
import TreeViewButtonGroup from "./treeviewbuttongroup";
import ViewTypeMenu from "./viewtypecontextmenu";
import FourColumn from "../nodepacks/FourColumn";
import ThreeColumn from "../nodepacks/ThreeColumn";
import UpdateUserExecutor from "../nodepacks/UpdateUserExecutor";
import StoreModelArrayStandard from "../nodepacks/StoreModelArrayStandard";
import { FunctionTemplateKeys } from "../constants/functiontypes";
import NavigateBack from "../nodepacks/NavigateBack";
import TreeViewItemContainer from "./treeviewitemcontainer";
import {
  getLinkInstance,
  GetNodesLinkedTo,
  TARGET,
  SOURCE,
  existsLinkBetween
} from "../methods/graph_methods";
import SelectInput from "./selectinput";
import CheckBox from "./checkbox";
import CreateStandardClaimService from "../nodepacks/CreateStandardClaimService";
import GetModelViewModelForList from "../nodepacks/GetModelViewModelForList";
import AddButtonToComponent from "../nodepacks/AddButtonToComponent";
import GetScreenValueParameter from "../nodepacks/GetScreenValueParameter";
import ConnectDataChainToCompontApiConnector from "../nodepacks/ConnectDataChainToCompontApiConnector";
import CreateNavigateToScreenDC from "../nodepacks/CreateNavigateToScreenDC";
import TextInput from "./textinput";
import CreateDashboard_1 from "../nodepacks/CreateDashboard_1";
import {
  ComponentTypes,
  SCREEN_COMPONENT_EVENTS,
  ComponentEvents,
  ComponentTags
} from "../constants/componenttypes";
import AddComponent from "../nodepacks/AddComponent";
import DataChain_SelectPropertyValue from "../nodepacks/DataChain_SelectPropertyValue";
import CreatePropertiesForFetch from "../nodepacks/CreatePropertiesForFetch";
import AddEvent from "../nodepacks/AddEvent";
import CreateModelPropertyGetterDC from "../nodepacks/CreateModelPropertyGetterDC";
import ReattachComponent from "../nodepacks/ReattachComponent";
import AddTitleToComponent from "../nodepacks/AddTitleToComponent";
import CollectionDataChainsIntoCollections from "../nodepacks/CollectionDataChainsIntoCollections";
import AttachDataChainsToViewTypeViewModel from "../nodepacks/AttachDataChainsToViewTypeViewModel";
import ModifyUpdateLinks from "../nodepacks/ModifyUpdateLinks";
import SetInnerApiValueToLocalContextInLists from "../nodepacks/SetInnerApiValueToLocalContextInLists";
import SetupApiBetweenComponents from "../nodepacks/SetupApiBetweenComponents";
const DATA_SOURCE = "DATA_SOURCE";
class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getMenuMode(mode) {
    let result = [...this.generalMenu()];
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    };
    switch (mode) {
      case "layout":
        result.push(
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Layout}
            toggle={() => {}}
          >
            <TreeViewMenu
              title={Titles.Layout}
              hideArrow={true}
              icon={"fa fa-taxi"}
              key={"layoutview"}
              onClick={() => {
                this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
                exit();
              }}
            />
            <TreeViewMenu
              title={Titles.MindMap}
              hideArrow={true}
              icon={"fa fa-taxi"}
              key={"mindmap"}
              onClick={() => {
                this.props.setVisual(MAIN_CONTENT, MIND_MAP);
                exit();
              }}
            />
            <TreeViewMenu
              title={Titles.CodeView}
              hideArrow={true}
              icon={"fa fa-taxi"}
              key={"codeview"}
              onClick={() => {
                this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
                exit();
              }}
            />
          </TreeViewMenu>
        );
        break;
      default:
        result.push(this.getContextMenu());
        break;
    }

    result.push(...this.eventMenu());
    result.push(...this.apiMenu());
    result.push(...this.operations());
    result.push(this.minimizeMenu());
    result.push(...this.linkOperations());
    result.push(this.hideTypeMenu());
    return result.filter(x => x);
  }
  linkOperations() {
    let result = [];
    var { state } = this.props;
    let selectedLink = UIA.Visual(state, UIA.SELECTED_LINK);
    if (selectedLink) {
      let link = getLinkInstance(UIA.GetCurrentGraph(), {
        target: selectedLink.target,
        source: selectedLink.source
      });
      if (link) {
        result.push(
          ...[
            <TreeViewMenu
              active={true}
              title={Titles.LinkType}
              key={Titles.LinkType}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              open={UIA.Visual(state, Titles.LinkType)}
              toggle={() => {
                this.props.toggleVisual(Titles.LinkType);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  options={Object.keys(LinkType)
                    .sort()
                    .map(v => ({
                      title: v,
                      value: LinkType[v],
                      id: LinkType[v]
                    }))}
                  label={Titles.LinkType}
                  onChange={value => {}}
                  value={UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE)}
                />
              </TreeViewItemContainer>
            </TreeViewMenu>
          ]
        );
        let linkType = UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE);
        switch (UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE)) {
          case LinkType.Style:
            result.push(
              <TreeViewMenu
                open={UIA.Visual(state, `linkType coponent`)}
                active={true}
                title={linkType}
                key={`${linkType}${selectedLink.id} componenttag`}
                innerStyle={{ maxHeight: 300, overflowY: "auto" }}
                toggle={() => {
                  this.props.toggleVisual(`linkType coponent`);
                }}
              >
                <TreeViewItemContainer>
                  <SelectInput
                    options={Object.keys(ComponentTags).map(x => ({
                      id: x,
                      value: x,
                      title: x
                    }))}
                    label={Titles.LinkType}
                    onChange={value => {
                      this.props.graphOperation([
                        {
                          operation: UIA.UPDATE_LINK_PROPERTY,
                          options: function() {
                            return {
                              id: link.id,
                              prop: LinkPropertyKeys.ComponentTag,
                              value: value
                            };
                          }
                        }
                      ]);
                    }}
                    value={UIA.GetLinkProperty(
                      link,
                      LinkPropertyKeys.ComponentTag
                    )}
                  />
                </TreeViewItemContainer>
              </TreeViewMenu>
            );
            break;
          case LinkType.ComponentExternalConnection:
          case LinkType.EventMethodInstance:
          case LinkType.ComponentExternalApi:
            let skip = false;
            if (LinkType.ComponentExternalApi === linkType) {
              if (
                ![NodeTypes.ViewType].some(
                  v =>
                    v === UIA.GetNodeProp(link.source, NodeProperties.NODEType)
                ) &&
                ![NodeTypes.ViewType].some(
                  v =>
                    v === UIA.GetNodeProp(link.target, NodeProperties.NODEType)
                )
              ) {
                skip = true;
              }
            }
            if (!skip)
              result.push(
                <TreeViewMenu
                  open={UIA.Visual(state, linkType)}
                  active={true}
                  title={linkType}
                  key={`${linkType}${selectedLink.id}`}
                  innerStyle={{ maxHeight: 300, overflowY: "auto" }}
                  toggle={() => {
                    this.props.toggleVisual(linkType);
                  }}
                >
                  <TreeViewItemContainer>
                    <CheckBox
                      label={LinkPropertyKeys.InstanceUpdate}
                      value={UIA.GetLinkProperty(
                        link,
                        LinkPropertyKeys.InstanceUpdate
                      )}
                      onChange={value => {
                        this.props.graphOperation([
                          {
                            operation: UIA.UPDATE_LINK_PROPERTY,
                            options: function() {
                              return {
                                id: link.id,
                                prop: LinkPropertyKeys.InstanceUpdate,
                                value: value
                              };
                            }
                          }
                        ]);
                      }}
                    />
                  </TreeViewItemContainer>
                </TreeViewMenu>
              );
            break;
        }
      }
    }
    return result;
  }
  hideTypeMenu() {
    let HIDE_TYPE_MENU = "HIDE_TYPE_MENU";
    let { state } = this.props;
    return (
      <TreeViewMenu
        open={UIA.Visual(state, HIDE_TYPE_MENU)}
        active={true}
        title={Titles.HideTypeMenu}
        innerStyle={{ maxHeight: 300, overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual(HIDE_TYPE_MENU);
        }}
      >
        {Object.keys(NodeTypes)
          .sort()
          .map(type => {
            return (
              <TreeViewMenu
                key={`node-${type}`}
                hideArrow={true}
                title={type}
                icon={
                  UIA.Hidden(state, NodeTypes[type])
                    ? "fa fa-circle-o"
                    : "fa fa-check-circle-o"
                }
                toggle={() => {
                  this.props.toggleHideByTypes(NodeTypes[type]);
                }}
              />
            );
          })}
      </TreeViewMenu>
    );
  }
  minimizeMenu() {
    let MINIMIZE_MENU = "MINIMIZE_MENU";
    let { state } = this.props;
    return (
      <TreeViewMenu
        open={UIA.Visual(state, MINIMIZE_MENU)}
        active={true}
        title={Titles.MinimizeTypeMenu}
        innerStyle={{ maxHeight: 300, overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual(MINIMIZE_MENU);
        }}
      >
        {Object.keys(NodeTypes)
          .sort()
          .map(type => {
            return (
              <TreeViewMenu
                key={`node-${type}`}
                hideArrow={true}
                title={type}
                icon={
                  !UIA.Minimized(state, NodeTypes[type])
                    ? "fa fa-circle-o"
                    : "fa fa-check-circle-o"
                }
                toggle={() => {
                  this.props.toggleMinimized(NodeTypes[type]);
                }}
              />
            );
          })}
      </TreeViewMenu>
    );
  }
  generalMenu() {
    let { state } = this.props;
    let graph = UIA.GetCurrentGraph();
    return [
      <TreeViewMenu
        open={UIA.Visual(state, "GENERAL_MENU")}
        active={true}
        title={Titles.Operations}
        innerStyle={{ maxHeight: 300, overflowY: "auto" }}
        toggle={() => {
          this.props.toggleVisual("GENERAL_MENU");
        }}
      >
        <TreeViewMenu
          open={UIA.Visual(state, "dccollections")}
          active={true}
          title={Titles.Collections}
          innerStyle={{ maxHeight: 300, overflowY: "auto" }}
          toggle={() => {
            this.props.toggleVisual("dccollections");
          }}
        >
          <TreeViewMenu
            title={"Update"}
            active={true}
            onClick={() => {
              this.props.graphOperation(CollectionDataChainsIntoCollections());
            }}
          />
          <TreeViewMenu
            title={"Clear"}
            active={true}
            onClick={() => {
              this.props.graphOperation(
                UIA.NodesByType(null, NodeTypes.DataChainCollection).map(v => ({
                  operation: UIA.REMOVE_NODE,
                  options: {
                    id: v.id
                  }
                }))
              );
            }}
          />
        </TreeViewMenu>
        <TreeViewMenu
          title={"Modify Update Links"}
          active={true}
          hideArrow={true}
          onClick={() => {
            this.props.graphOperation(ModifyUpdateLinks());
          }}
        />
        <TreeViewMenu
          title={NodeTypes.ComponentApi}
          open={UIA.Visual(state, NodeTypes.ComponentApi)}
          active={true}
          onClick={() => {
            this.props.toggleVisual(NodeTypes.ComponentApi);
          }}
        >
          <TreeViewMenu
            title={"Value(s) To Local Context"}
            description={SetInnerApiValueToLocalContextInLists.description}
            active={true}
            hideArrow={true}
            onClick={() => {
              this.props.graphOperation(
                SetInnerApiValueToLocalContextInLists()
              );
            }}
          />
          <TreeViewMenu
            title={"Create Component Api"}
            open={UIA.Visual(state, "Create Component Api")}
            active={true}
            onClick={() => {
              this.props.toggleVisual("Create Component Api");
            }}
          >
            <TreeViewItemContainer>
              <SelectInput
                label={`${Titles.Component} A`}
                options={UIA.NodesByType(
                  this.props.state,
                  NodeTypes.ComponentNode
                )
                  .sort((a, b) => {
                    return UIA.GetNodeTitle(a).localeCompare(
                      UIA.GetNodeTitle(b)
                    );
                  })
                  .toNodeSelect()}
                onChange={value => {
                  this.setState({
                    componentA: value
                  });
                }}
                value={this.state.componentA}
              />
            </TreeViewItemContainer>
            <TreeViewItemContainer>
              <TextInput
                immediate={true}
                label={`${Titles.ExternalApi} A`}
                placeholder={`${Titles.ExternalApi} A`}
                onChange={value => {
                  this.setState({
                    externalApiA: value
                  });
                }}
                value={this.state.externalApiA}
              />
            </TreeViewItemContainer>
            <TreeViewItemContainer>
              <TextInput
                immediate={true}
                label={`${Titles.InternalApi} A`}
                placeholder={Titles.InternalApi}
                onChange={value => {
                  this.setState({
                    internalApiA: value
                  });
                }}
                value={this.state.internalApiA}
              />
            </TreeViewItemContainer>
            <TreeViewItemContainer>
              <SelectInput
                label={`${Titles.Component} B`}
                options={UIA.NodesByType(
                  this.props.state,
                  NodeTypes.ComponentNode
                )
                  .filter(x =>
                    existsLinkBetween(graph, {
                      source: this.state.componentA,
                      target: x.id
                    })
                  )
                  .toNodeSelect()}
                onChange={value => {
                  this.setState({
                    componentB: value
                  });
                }}
                value={this.state.componentB}
              />
            </TreeViewItemContainer>
            <TreeViewItemContainer>
              <TextInput
                immediate={true}
                label={`${Titles.ExternalApi} B`}
                placeholder={`${Titles.ExternalApi} B`}
                onChange={value => {
                  this.setState({
                    externalApiB: value
                  });
                }}
                value={this.state.externalApiB}
              />
            </TreeViewItemContainer>
            <TreeViewItemContainer>
              <TextInput
                immediate={true}
                label={`${Titles.InternalApi} B`}
                placeholder={`${Titles.InternalApi} B`}
                onChange={value => {
                  this.setState({
                    internalApiB: value
                  });
                }}
                value={this.state.internalApiB}
              />
            </TreeViewItemContainer>
            {this.state.componentA &&
            this.state.componentB &&
            this.state.externalApiB &&
            this.state.internalApiB &&
            this.state.internalApiA &&
            this.state.externalApiA ? (
              <TreeViewMenu
                title={"Setup Api Between Components"}
                description={SetupApiBetweenComponents.description}
                active={true}
                hideArrow={true}
                onClick={() => {
                  this.props.graphOperation(
                    SetupApiBetweenComponents({
                      component_a: {
                        id: this.state.componentA,
                        external: this.state.externalApiA,
                        internal: this.state.internalApiA
                      },
                      component_b: {
                        id: this.state.componentB,
                        external: this.state.externalApiB,
                        internal: this.state.internalApiB
                      }
                    })
                  );
                }}
              />
            ) : null}
          </TreeViewMenu>
        </TreeViewMenu>

        <TreeViewMenu
          title={`Create Dashboard`}
          open={UIA.Visual(state, `Create Dashboard`)}
          active={true}
          onClick={() => {
            // this.props.graphOperation(GetModelViewModelForList({}));
            this.props.toggleVisual(`Create Dashboard`);
          }}
        >
          <TreeViewItemContainer>
            <TextInput
              immediate={true}
              label={Titles.Name}
              placeholder={Titles.EnterName}
              onChange={value => {
                this.setState({
                  dashboard: value
                });
              }}
              value={this.state.dashboard}
            />
          </TreeViewItemContainer>
          {this.state.dashboard ? (
            <TreeViewMenu
              title={Titles.Execute}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  CreateDashboard_1({
                    name: this.state.dashboard
                  })
                );
                this.setState({ dashboard: "" });
              }}
            />
          ) : null}
        </TreeViewMenu>
      </TreeViewMenu>
    ];
  }
  operations() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
    let temp;

    switch (currentNodeType) {
      case NodeTypes.DataChainCollection:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              active={true}
              title={Titles.AddDataChainCollection}
              onClick={() => {
                if (
                  !GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                    id: currentNode.id,
                    link: LinkType.DataChainCollection,
                    direction: SOURCE
                  }).some(
                    v =>
                      UIA.GetNodeProp(v, NodeProperties.NODEType) ===
                      currentNodeType
                  )
                ) {
                  this.props.graphOperation([
                    {
                      operation: UIA.ADD_NEW_NODE,
                      options: function() {
                        return {
                          nodeType: NodeTypes.DataChainCollection,
                          linkProperties: {
                            properties: {
                              ...LinkProperties.DataChainCollection
                            }
                          },
                          parent: currentNode.id,
                          properties: {
                            [NodeProperties.UIText]: currentNodeType
                          }
                        };
                      }
                    }
                  ]);
                }
              }}
            />
          </TreeViewMenu>
        ];
      case NodeTypes.DataChain:
        //DataChain_SelectPropertyValue
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`Select Model Property`}
              open={UIA.Visual(state, `Select Model Property`)}
              active={true}
              onClick={() => {
                // this.props.graphOperation(GetModelViewModelForList({}));
                this.props.toggleVisual(`Select Model Property`);
              }}
            >
              <TreeViewItemContainer>
                <TextInput
                  label={Titles.Name}
                  immediate={true}
                  onChange={value => {
                    this.setState({
                      name: value
                    });
                  }}
                  value={this.state.name}
                />
              </TreeViewItemContainer>
              <TreeViewItemContainer>
                <SelectInput
                  label={Titles.Models}
                  options={UIA.NodesByType(
                    this.props.state,
                    NodeTypes.Model
                  ).toNodeSelect()}
                  onChange={value => {
                    this.setState({
                      model: value
                    });
                  }}
                  value={this.state.model}
                />
              </TreeViewItemContainer>
              {this.state.model ? (
                <TreeViewItemContainer>
                  <SelectInput
                    label={Titles.Properties}
                    options={UIA.GetModelPropertyChildren(
                      this.state.model
                    ).toNodeSelect()}
                    onChange={value => {
                      this.setState({
                        property: value
                      });
                    }}
                    value={this.state.property}
                  />
                </TreeViewItemContainer>
              ) : null}
              {this.state.model && this.state.name && this.state.property ? (
                <TreeViewMenu
                  title={Titles.Execute}
                  hideArrow={true}
                  onClick={() => {
                    this.props.graphOperation([
                      ...DataChain_SelectPropertyValue({
                        name: this.state.name,
                        dataChain: currentNode.id,
                        model: this.state.model,
                        property: this.state.property
                      })
                    ]);
                  }}
                />
              ) : null}
            </TreeViewMenu>
          </TreeViewMenu>
        ];
      case NodeTypes.ComponentApiConnector:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`Assign Screen Value Parameter`}
              open={UIA.Visual(state, `Assign Screen Value Parmater`)}
              active={true}
              onClick={() => {
                // this.props.graphOperation(GetModelViewModelForList({}));
                this.props.toggleVisual(`Assign Screen Value Parmater`);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  label={Titles.Screen}
                  options={UIA.NodesByType(
                    this.props.state,
                    NodeTypes.Screen
                  ).toNodeSelect()}
                  onChange={value => {
                    this.setState({
                      screen: value
                    });
                  }}
                  value={this.state.screen}
                />
              </TreeViewItemContainer>
              {this.state.screen ? (
                <TreeViewMenu
                  title={Titles.Execute}
                  hideArrow={true}
                  onClick={() => {
                    this.props.graphOperation([
                      ...GetScreenValueParameter({
                        screen: UIA.GetNodeTitle(this.state.screen),
                        callback: dataChain => {
                          temp = dataChain;
                        }
                      }),
                      ...ConnectDataChainToCompontApiConnector({
                        dataChain: function() {
                          return temp.entry;
                        },
                        componentApiConnector: function() {
                          return currentNode.id;
                        }
                      })
                    ]);
                  }}
                />
              ) : null}
            </TreeViewMenu>
          </TreeViewMenu>
        ];
      case NodeTypes.EventMethodInstance:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`Navigate Back After`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  NavigateBack({
                    eventMethodInstance: currentNode.id,
                    name: `${UIA.GetNodeTitle(currentNode)}`
                  })
                );
              }}
            />
            <TreeViewMenu
              title={`Navigate to screen`}
              open={UIA.Visual(state, `Navigate to screen`)}
              active={true}
              onClick={() => {
                // this.props.graphOperation(GetModelViewModelForList({}));
                this.props.toggleVisual(`Navigate to screen`);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  label={Titles.Screen}
                  options={UIA.NodesByType(
                    this.props.state,
                    NodeTypes.Screen
                  ).toNodeSelect()}
                  onChange={value => {
                    this.setState({
                      screen: value
                    });
                  }}
                  value={this.state.screen}
                />
              </TreeViewItemContainer>
              {this.state.screen ? (
                <TreeViewMenu
                  title={`Execute`}
                  onClick={() => {
                    this.props.graphOperation(
                      CreateNavigateToScreenDC({
                        screen: UIA.GetNodeTitle(this.state.screen)
                      })
                    );
                  }}
                />
              ) : null}
            </TreeViewMenu>
          </TreeViewMenu>
        ];
      case NodeTypes.LifeCylceMethodInstance:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`Add Store Model Array Standard Handler`}
              hideArrow={true}
              onClick={() => {
                let methodCall = UIA.GetNodeMethodCall(currentNode.id);
                if (methodCall) {
                  let model =
                    UIA.GetMethodProps(methodCall.id) ||
                    UIA.GetMethodProps(
                      methodCall.id,
                      FunctionTemplateKeys.Model
                    );
                  if (model) {
                    model =
                      model[FunctionTemplateKeys.ModelOutput] ||
                      model[FunctionTemplateKeys.Model];
                    if (model) {
                      this.props.graphOperation(
                        StoreModelArrayStandard({
                          model,
                          state_key: `${UIA.GetNodeTitle(model)} State`
                        })
                      );
                    }
                  }
                }
              }}
            />
          </TreeViewMenu>
        ];
      case NodeTypes.ComponentExternalApi:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              open={UIA.Visual(state, "AddModelPropertyGetterDC")}
              title={"Add Model Property Getter"}
              active={true}
              onClick={() => {
                this.props.toggleVisual("AddModelPropertyGetterDC");
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  label={Titles.Models}
                  options={UIA.NodesByType(
                    this.props.state,
                    NodeTypes.Model
                  ).toNodeSelect()}
                  onChange={value => {
                    this.setState({
                      model: value
                    });
                  }}
                  value={this.state.model}
                />
              </TreeViewItemContainer>
              <TreeViewItemContainer>
                <SelectInput
                  label={Titles.Models}
                  options={UIA.GetModelPropertyChildren(
                    this.state.model
                  ).toNodeSelect()}
                  onChange={value => {
                    this.setState({
                      property: value
                    });
                  }}
                  value={this.state.property}
                />
              </TreeViewItemContainer>
              {this.state.model && this.state.property ? (
                <TreeViewMenu
                  title={`Execute`}
                  hideArrow={true}
                  onClick={() => {
                    this.props.graphOperation([
                      ...CreateModelPropertyGetterDC({
                        model: this.state.model,
                        property: this.state.property,
                        propertyName: UIA.GetNodeTitle(this.state.property),
                        modelName: UIA.GetNodeTitle(this.state.model),
                        callback: context => {
                          temp = context.entry;
                        }
                      }),
                      {
                        operation: UIA.ADD_LINK_BETWEEN_NODES,
                        options: function() {
                          return {
                            source: currentNode.id,
                            target: temp,
                            properties: { ...LinkProperties.DataChainLink }
                          };
                        }
                      }
                    ]);
                  }}
                />
              ) : null}
            </TreeViewMenu>
            <TreeViewMenu
              title={`Connect to Title Service`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation([
                  {
                    operation: UIA.CONNECT_TO_TITLE_SERVICE,
                    options: {
                      id: currentNode.id
                    }
                  }
                ]);
              }}
            />
            {UIA.GetNodeTitle(currentNode) === "viewModel" ? (
              <TreeViewMenu
                title={`Setup View Model On Screen`}
                open={UIA.Visual(state, `Setup View Model On Screen`)}
                active={true}
                onClick={() => {
                  // this.props.graphOperation(GetModelViewModelForList({}));
                  this.props.toggleVisual(`Setup View Model On Screen`);
                }}
              >
                <TreeViewItemContainer>
                  <SelectInput
                    label={Titles.Models}
                    options={UIA.NodesByType(
                      this.props.state,
                      NodeTypes.Model
                    ).toNodeSelect()}
                    onChange={value => {
                      this.setState({
                        model: value
                      });
                    }}
                    value={this.state.model}
                  />
                </TreeViewItemContainer>
                {this.state.model ? (
                  <TreeViewMenu
                    title={`Execute`}
                    onClick={() => {
                      this.props.graphOperation(
                        GetModelViewModelForList({
                          model: this.state.model,
                          modelViewName: UIA.GetNodeTitle(this.state.model),
                          viewModel: currentNode.id
                        })
                      );
                    }}
                  />
                ) : null}
              </TreeViewMenu>
            ) : null}
          </TreeViewMenu>
        ];
      case NodeTypes.Executor:
        //UpdateUserExecutor
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`${Titles.Add} Update User`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  UpdateUserExecutor({ node0: currentNode.id })
                );
              }}
            />
          </TreeViewMenu>
        ];
      case NodeTypes.Model:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "OPERATIONS")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("OPERATIONS");
            }}
          >
            <TreeViewMenu
              title={`${Titles.Add} Name|Description`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  AddNameDescription({ node0: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={`Create Claim Service(Agent)`}
              hideArrow={true}
              onClick={() => {
                let claimService = UIA.GetNodeByProperties({
                  [NodeProperties.NODEType]: NodeTypes.ClaimService
                });
                if (!claimService) {
                  this.props.graphOperation(
                    CreateStandardClaimService({
                      modelName: UIA.GetNodeTitle(currentNode),
                      model: currentNode.id,
                      user: UIA.GetNodeProp(currentNode, NodeProperties.UIUser)
                    })
                  );
                }
              }}
            />
            <TreeViewMenu
              title={`Setup Fetch Result`}
              hideArrow={true}
              onClick={() => {
                let connectedNodes = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                  id: currentNode.id,
                  link: LinkType.FetchServiceOuput
                });
                if (connectedNodes.length) {
                  this.props.graphOperation(
                    CreatePropertiesForFetch({
                      id: currentNode.id
                    })
                  );
                }
              }}
            />
          </TreeViewMenu>
        ];
      case NodeTypes.ScreenOption:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "ComponentNode")}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("ComponentNode");
            }}
          >
            <TreeViewMenu
              title={Titles.AddButtonToComponent}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  AddButtonToComponent({ component: currentNode.id })
                );
              }}
            />
          </TreeViewMenu>,
          <TreeViewMenu
            open={UIA.Visual(state, "ScreenOptionOperations")}
            active={true}
            title={Titles.Layout}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("ScreenOptionOperations");
            }}
          >
            <TreeViewMenu
              title={`Set Tiny Tweaks Layout`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  TinyTweaks({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={`Basic Application Layout`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  BasicApplicationLayout({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={`Basic Double Side Column`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  BasicDoubleSideColumn({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={`Four Column`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  FourColumn({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={`Three Column`}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  ThreeColumn({ component: currentNode.id })
                );
              }}
            />
          </TreeViewMenu>
        ];
      case NodeTypes.ComponentNode:
        let componentType = UIA.GetNodeProp(
          currentNode,
          NodeProperties.ComponentType
        );
        let uiType = UIA.GetNodeProp(currentNode, NodeProperties.UIType);
        let parent = null;
        if (
          ComponentTypes[uiType] &&
          ComponentTypes[uiType][componentType] &&
          ComponentTypes[uiType][componentType].layout &&
          UIA.Visual(state, "Reattach Component")
        ) {
          let graph = UIA.GetCurrentGraph();
          parent = GetNodesLinkedTo(graph, {
            id: currentNode.id,
            link: LinkType.Component,
            direction: TARGET
          })[0];
        }
        return [
          <TreeViewMenu
            open={UIA.Visual(state, "Styling")}
            active={true}
            title={Titles.Styling}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("Styling");
            }}
          >
            <TreeViewMenu
              title={Titles.AddDataChain}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation([
                  {
                    operation: UIA.ADD_NEW_NODE,
                    options: function() {
                      return {
                        nodeType: NodeTypes.DataChain,
                        linkProperties: {
                          properties: { ...LinkProperties.DataChainLink }
                        },
                        parent: currentNode.id,
                        properties: {
                          [NodeProperties.UIText]: `data chain`
                        },
                        groupProperties: {}
                      };
                    }
                  }
                ]);
              }}
            />
            <TreeViewMenu
              title={Titles.AddSelector}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation([
                  {
                    operation: UIA.ADD_NEW_NODE,
                    options: function() {
                      return {
                        nodeType: NodeTypes.Selector,
                        linkProperties: {
                          properties: { ...LinkProperties.SelectorLink }
                        },
                        parent: currentNode.id,
                        properties: {
                          [NodeProperties.UIText]: `select internal variables`,
                          [NodeProperties.SelectorType]:
                            SelectorType.InternalProperties
                        },
                        groupProperties: {}
                      };
                    }
                  }
                ]);
              }}
            />
          </TreeViewMenu>,
          <TreeViewMenu
            open={UIA.Visual(state, "ComponentNode")}
            active={true}
            title={Titles.Layout}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual("ComponentNode");
            }}
          >
            <TreeViewMenu
              title={Titles.AddLifeCylceEvents}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  SCREEN_COMPONENT_EVENTS.filter(x => {
                    return !GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                      id: currentNode.id,
                      link: LinkType.LifeCylceMethod
                    }).find(
                      _y => UIA.GetNodeProp(_y, NodeProperties.Event) === x
                    );
                  }).map(t => {
                    return {
                      operation: UIA.ADD_NEW_NODE,
                      options: function() {
                        return {
                          nodeType: NodeTypes.LifeCylceMethod,
                          properties: {
                            [NodeProperties.EventType]: t,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.UIText]: `${t}`
                          },
                          links: [
                            {
                              target: currentNode.id,
                              linkProperties: {
                                properties: {
                                  ...LinkProperties.LifeCylceMethod
                                }
                              }
                            }
                          ]
                        };
                      }
                    };
                  })
                );
              }}
            />
            <TreeViewMenu
              title={Titles.AddButtonToComponent}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  AddButtonToComponent({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              title={Titles.AddTitleToComponent}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  AddTitleToComponent({ component: currentNode.id })
                );
              }}
            />
            <TreeViewMenu
              open={UIA.Visual(state, `${currentNodeType} eventtype`)}
              active={true}
              title={Titles.AddEvent}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual(`${currentNodeType} eventtype`);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  options={Object.keys(ComponentEvents).map(v => ({
                    title: v,
                    id: v,
                    value: v
                  }))}
                  label={Titles.Select}
                  onChange={value => {
                    this.setState({ eventType: value });
                  }}
                  value={this.state.eventType}
                />
              </TreeViewItemContainer>
              <TreeViewItemContainer>
                <SelectInput
                  options={[true, false].map(v => ({
                    title: `${v}`,
                    id: v,
                    value: v
                  }))}
                  label={Titles.IncludeEventHandler}
                  onChange={value => {
                    this.setState({ eventTypeHandler: value });
                  }}
                  value={this.state.eventTypeHandler}
                />
              </TreeViewItemContainer>
              {this.state.eventType ? (
                <TreeViewMenu
                  title={Titles.AddEvent}
                  hideArrow={true}
                  onClick={() => {
                    let properties = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                      id: currentNode.id,
                      link: LinkType.DefaultViewType
                    }).filter(
                      x =>
                        UIA.GetNodeProp(x, NodeProperties.NODEType) ===
                        NodeTypes.Property
                    );

                    this.props.graphOperation(
                      AddEvent({
                        component: currentNode.id,
                        eventType: this.state.eventType,
                        eventTypeHandler: properties.length
                          ? this.state.eventTypeHandler
                          : false,
                        property: properties.length ? properties[0].id : null
                      })
                    );
                  }}
                />
              ) : null}
            </TreeViewMenu>
            <TreeViewMenu
              open={UIA.Visual(state, "Adding Component")}
              active={true}
              title={Titles.AddComponentNew}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual("Adding Component");
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  options={Object.keys(ComponentTypes.ReactNative).map(v => ({
                    title: v,
                    id: v,
                    value: v
                  }))}
                  label={Titles.ComponentType}
                  onChange={value => {
                    this.setState({ componentType: value });
                  }}
                  value={this.state.componentType}
                />
              </TreeViewItemContainer>
              {this.state.componentType ? (
                <TreeViewMenu
                  title={`${Titles.Add} ${this.state.componentType}`}
                  hideArrow={true}
                  onClick={() => {
                    this.props.graphOperation(
                      AddComponent({
                        component: currentNode.id,
                        componentType: this.state.componentType
                      })
                    );
                  }}
                />
              ) : null}
            </TreeViewMenu>
            <TreeViewMenu
              open={UIA.Visual(state, "Reattach Component")}
              active={true}
              title={Titles.ReattachComponent}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual("Reattach Component");
              }}
            >
              {parent ? (
                <TreeViewItemContainer>
                  <SelectInput
                    options={GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                      id: parent.id,
                      link: LinkType.Component
                    })
                      .filter(x => x.id !== currentNode.id)
                      .toNodeSelect()}
                    label={Titles.ComponentType}
                    onChange={value => {
                      this.setState({ component: value });
                    }}
                    value={this.state.component}
                  />
                </TreeViewItemContainer>
              ) : null}
              {parent && this.state.component ? (
                <TreeViewMenu
                  title={Titles.Execute}
                  hideArrow={true}
                  onClick={() => {
                    this.props.graphOperation(
                      ReattachComponent({
                        component: this.state.component,
                        base: currentNode.id,
                        parent: parent.id
                      })
                    );
                  }}
                />
              ) : null}
            </TreeViewMenu>
          </TreeViewMenu>
        ];
      case NodeTypes.Validator:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, NodeTypes.Validator)}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual(NodeTypes.Validator);
            }}
          >
            <TreeViewItemContainer>
              <SelectInput
                options={UIA.NodesByType(this.props.state, NodeTypes.Validator)
                  .toNodeSelect()
                  .filter(x => x.id !== currentNode.id)}
                label={Titles.CopyValidationConditions}
                onChange={value => {
                  this.setState({ validator: value });
                }}
                value={this.state.validator}
              />
            </TreeViewItemContainer>
            {this.state.validator ? (
              <TreeViewMenu
                title={Titles.Execute}
                hideArrow={true}
                onClick={() => {
                  let conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                    id: this.state.validator,
                    link: LinkType.Condition
                  }).map(v => UIA.GetNodeProp(v, NodeProperties.Condition));
                  let method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                    id: this.state.validator,
                    link: LinkType.FunctionOperator
                  }).find(x => x);
                  let currentConditions = GetNodesLinkedTo(
                    UIA.GetCurrentGraph(),
                    {
                      id: currentNode.id,
                      link: LinkType.Condition
                    }
                  );
                  let currentNodeMethod = GetNodesLinkedTo(
                    UIA.GetCurrentGraph(),
                    {
                      id: currentNode.id,
                      link: LinkType.FunctionOperator
                    }
                  ).find(x => x);
                  let functionType = UIA.GetNodeProp(
                    method,
                    NodeProperties.FunctionType
                  );
                  let currentNodeMethodFunctionType = UIA.GetNodeProp(
                    currentNodeMethod,
                    NodeProperties.FunctionType
                  );
                  let result = [];
                  currentConditions.map(cc => {
                    result.push({
                      operation: UIA.REMOVE_NODE,
                      options: function() {
                        return {
                          id: cc.id
                        };
                      }
                    });
                  });
                  conditions.map(condition => {
                    result.push({
                      operation: UIA.ADD_NEW_NODE,
                      options: function() {
                        let temp = JSON.parse(JSON.stringify(condition));
                        temp.methods[currentNodeMethodFunctionType] =
                          temp.methods[functionType];
                        delete temp.methods[functionType];
                        return {
                          nodeType: NodeTypes.Condition,
                          properties: {
                            [NodeProperties.Condition]: temp
                          },
                          parent: currentNode.id,
                          groupProperties: {},
                          linkProperties: {
                            properties: {
                              ...LinkProperties.ConditionLink
                            }
                          }
                        };
                      }
                    });
                  });
                  this.props.graphOperation(result);
                }}
              />
            ) : null}
          </TreeViewMenu>
        ];
      case NodeTypes.Permission:
        // getNodePropertyGuids()
        return [
          <TreeViewMenu
            open={UIA.Visual(state, NodeTypes.Permission)}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual(NodeTypes.Permission);
            }}
          >
            <TreeViewItemContainer>
              <SelectInput
                options={UIA.NodesByType(this.props.state, NodeTypes.Permission)
                  .toNodeSelect()
                  .filter(x => x.id !== currentNode.id)}
                label={Titles.CopyPermissionConditions}
                onChange={value => {
                  this.setState({ permission: value });
                }}
                value={this.state.permission}
              />
            </TreeViewItemContainer>
            {this.state.permission ? (
              <TreeViewMenu
                title={Titles.Execute}
                hideArrow={true}
                onClick={() => {
                  let conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                    id: this.state.permission,
                    link: LinkType.Condition
                  }).map(v => UIA.GetNodeProp(v, NodeProperties.Condition));
                  let method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                    id: this.state.permission,
                    link: LinkType.FunctionOperator
                  }).find(x => x);
                  let currentConditions = GetNodesLinkedTo(
                    UIA.GetCurrentGraph(),
                    {
                      id: currentNode.id,
                      link: LinkType.Condition
                    }
                  );
                  let currentNodeMethod = GetNodesLinkedTo(
                    UIA.GetCurrentGraph(),
                    {
                      id: currentNode.id,
                      link: LinkType.FunctionOperator
                    }
                  ).find(x => x);
                  let functionType = UIA.GetNodeProp(
                    method,
                    NodeProperties.FunctionType
                  );
                  let currentNodeMethodFunctionType = UIA.GetNodeProp(
                    currentNodeMethod,
                    NodeProperties.FunctionType
                  );
                  let result = [];
                  currentConditions.map(cc => {
                    result.push({
                      operation: UIA.REMOVE_NODE,
                      options: function() {
                        return {
                          id: cc.id
                        };
                      }
                    });
                  });
                  conditions.map(condition => {
                    result.push({
                      operation: UIA.ADD_NEW_NODE,
                      options: function() {
                        let temp = JSON.parse(JSON.stringify(condition));
                        temp.methods[currentNodeMethodFunctionType] =
                          temp.methods[functionType];
                        delete temp.methods[functionType];
                        return {
                          nodeType: NodeTypes.Condition,
                          properties: {
                            [NodeProperties.Condition]: temp
                          },
                          parent: currentNode.id,
                          groupProperties: {},
                          linkProperties: {
                            properties: {
                              ...LinkProperties.ConditionLink
                            }
                          }
                        };
                      }
                    });
                  });
                  this.props.graphOperation(result);
                }}
              />
            ) : null}
          </TreeViewMenu>
        ];
      case NodeTypes.ViewType:
        return [
          <TreeViewMenu
            open={UIA.Visual(state, currentNodeType)}
            active={true}
            title={Titles.Operations}
            innerStyle={{ maxHeight: 300, overflowY: "auto" }}
            toggle={() => {
              this.props.toggleVisual(currentNodeType);
            }}
          >
            <TreeViewMenu
              open={UIA.Visual(state, `${currentNodeType} eventtype`)}
              active={true}
              title={Titles.AddEvent}
              innerStyle={{ maxHeight: 300, overflowY: "auto" }}
              toggle={() => {
                this.props.toggleVisual(`${currentNodeType} eventtype`);
              }}
            >
              <TreeViewItemContainer>
                <SelectInput
                  options={Object.keys(ComponentEvents).map(v => ({
                    title: v,
                    id: v,
                    value: v
                  }))}
                  label={Titles.Select}
                  onChange={value => {
                    this.setState({ eventType: value });
                  }}
                  value={this.state.eventType}
                />
              </TreeViewItemContainer>
              <TreeViewItemContainer>
                <SelectInput
                  options={[true, false].map(v => ({
                    title: `${v}`,
                    id: v,
                    value: v
                  }))}
                  label={Titles.IncludeEventHandler}
                  onChange={value => {
                    this.setState({ eventTypeHandler: value });
                  }}
                  value={this.state.eventTypeHandler}
                />
              </TreeViewItemContainer>
              {this.state.eventType ? (
                <TreeViewMenu
                  title={Titles.AddEvent}
                  hideArrow={true}
                  onClick={() => {
                    let properties = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
                      id: currentNode.id,
                      link: LinkType.DefaultViewType
                    }).filter(
                      x =>
                        UIA.GetNodeProp(x, NodeProperties.NODEType) ===
                        NodeTypes.Property
                    );

                    this.props.graphOperation(
                      AddEvent({
                        component: currentNode.id,
                        eventType: this.state.eventType,
                        eventTypeHandler: properties.length
                          ? this.state.eventTypeHandler
                          : false,
                        property: properties.length ? properties[0].id : null
                      })
                    );
                  }}
                />
              ) : null}
            </TreeViewMenu>
            <TreeViewMenu
              hideArrow={true}
              title={Titles.AddSharedViewModel}
              description={AttachDataChainsToViewTypeViewModel.description}
              onClick={() => {
                this.props.graphOperation(
                  AttachDataChainsToViewTypeViewModel({
                    viewType: currentNode.id
                  })
                );
              }}
            />
          </TreeViewMenu>
        ];
    }
    return [];
  }
  apiMenu() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
    switch (currentNodeType) {
      case NodeTypes.DataChain:
        return [this.getDataChainContextMenu()];
      case NodeTypes.ComponentNode:
        let componentType = UIA.GetNodeProp(
          currentNode,
          NodeProperties.ComponentType
        );
        switch (componentType) {
          case "Button":
            return [this.getButtonApiMenu(currentNode)];
          default:
            return [this.getGenericComponentApiMenu(currentNode)];
        }
        break;
    }
    return [];
  }
  eventMenu() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
    switch (currentNodeType) {
      case NodeTypes.ComponentNode:
        let componentType = UIA.GetNodeProp(
          currentNode,
          NodeProperties.ComponentType
        );
        switch (componentType) {
          case "Menu":
          case "Button":
            return [this.getButtonEventMenu(currentNode)];
        }
        break;
    }
    return [];
  }
  getContextMenu() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
    switch (currentNodeType) {
      case NodeTypes.ComponentNode:
      case NodeTypes.Screen:
      case NodeTypes.ScreenOption:
      case NodeTypes.EventMethodInstance:
      default:
        return this.getGenericLinks(currentNode);
    }
  }
  getViewTypes() {
    return <ViewTypeMenu />;
  }
  getButtonApiMenu(currentNode) {
    let { state } = this.props;
    return (
      <TreeViewMenu
        open={UIA.Visual(state, Titles.ComponentAPIMenu)}
        active={true}
        title={Titles.ComponentAPIMenu}
        toggle={() => {
          this.props.toggleVisual(Titles.ComponentAPIMenu);
        }}
      >
        <TreeViewMenu
          title={`${Titles.Add} Label`}
          hideArrow={true}
          onClick={() => {
            this.props.addComponentApiNodes(currentNode.id, "label");
          }}
        />
        <TreeViewMenu
          title={`${Titles.Add} Value`}
          hideArrow={true}
          onClick={() => {
            this.props.addComponentApiNodes(currentNode.id, "value");
          }}
        />
        <TreeViewMenu
          title={`${Titles.Add} ViewModel`}
          hideArrow={true}
          onClick={() => {
            this.props.addComponentApiNodes(currentNode.id, "viewModel");
          }}
        />
      </TreeViewMenu>
    );
  }
  getGenericComponentApiMenu(currentNode) {
    let { state } = this.props;
    return (
      <TreeViewMenu
        open={UIA.Visual(state, Titles.ComponentAPIMenu)}
        active={true}
        title={Titles.ComponentAPIMenu}
        toggle={() => {
          this.props.toggleVisual(Titles.ComponentAPIMenu);
        }}
      >
        <TreeViewMenu
          title={`${Titles.Add} Label`}
          hideArrow={true}
          onClick={() => {
            this.props.addComponentApiNodes(currentNode.id, "label");
          }}
        />
        <TreeViewMenu
          title={`${Titles.Add} Value`}
          hideArrow={true}
          onClick={() => {
            this.props.addComponentApiNodes(currentNode.id, "value");
          }}
        />
        <TreeViewMenu
          title={`${Titles.Add} Custom`}
          open={UIA.Visual(state, "Custom Api Menu")}
          active={true}
          onClick={() => {
            // this.props.addComponentApiNodes(currentNode.id, "value");
            this.props.toggleVisual("Custom Api Menu");
          }}
        >
          <TreeViewItemContainer>
            <TextInput
              immediate={true}
              label={Titles.Name}
              placeholder={Titles.EnterName}
              onChange={value => {
                this.setState({
                  customApi: value
                });
              }}
              value={this.state.customApi}
            />
          </TreeViewItemContainer>
          {this.state.customApi ? (
            <TreeViewMenu
              title={`${Titles.Add} ${this.state.customApi}`}
              hideArrow={true}
              onClick={() => {
                this.props.addComponentApiNodes(
                  currentNode.id,
                  this.state.customApi
                );
              }}
            />
          ) : null}
        </TreeViewMenu>
      </TreeViewMenu>
    );
  }
  getButtonEventMenu(currentNode) {
    let { state } = this.props;
    switch (UIA.GetNodeProp(currentNode, NodeProperties.UIType)) {
      case UITypes.ReactNative:
        return (
          <TreeViewMenu
            open={UIA.Visual(state, Titles.Events)}
            active={true}
            title={Titles.Events}
            toggle={() => {
              this.props.toggleVisual(Titles.Events);
            }}
          >
            <TreeViewMenu
              title={`${Titles.Add} onPress`}
              hideArrow={true}
              onClick={() => {
                this.props.addComponentEventTo(currentNode.id, "onPress");
              }}
            />
          </TreeViewMenu>
        );
        break;
      case UITypes.ElectronIO:
        return (
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Events}
            toggle={() => {}}
          >
            <TreeViewMenu
              title={`${Titles.Add} onClick`}
              hideArrow={true}
              onClick={() => {
                this.props.addComponentEventTo(currentNode.id, "onClick");
              }}
            />
          </TreeViewMenu>
        );
        break;
    }
  }
  getComponentExternalMenu(currentNode) {
    let { state } = this.props;
    return (
      <TreeViewMenu
        open={true}
        active={true}
        title={Titles.Select}
        open={UIA.Visual(state, Titles.Select)}
        toggle={() => {
          this.props.toggleVisual(Titles.Select);
        }}
      >
        <TreeViewMenu
          title={LinkType.ComponentExternalConnection}
          hideArrow={true}
          onClick={() => {
            this.props.togglePinnedConnectedNodesByLinkType(
              currentNode.id,
              LinkType.ComponentExternalConnection
            );
          }}
        />
        <TreeViewMenu
          title={LinkType.SelectorLink}
          hideArrow={true}
          onClick={() => {
            this.props.togglePinnedConnectedNodesByLinkType(
              currentNode.id,
              LinkType.SelectorLink
            );
          }}
        />
        <TreeViewMenu
          title={LinkType.DataChainLink}
          hideArrow={true}
          onClick={() => {
            this.props.togglePinnedConnectedNodesByLinkType(
              currentNode.id,
              LinkType.DataChainLink
            );
          }}
        />
      </TreeViewMenu>
    );
  }
  getGenericLinks(current) {
    if (!current || !current.id) {
      return [];
    }
    let { state } = this.props;
    var linkTypes = UIA.GetNodesLinkTypes(current.id);
    return (
      <TreeViewMenu
        active={true}
        title={Titles.Select}
        open={UIA.Visual(state, Titles.Select)}
        toggle={() => {
          this.props.toggleVisual(Titles.Select);
        }}
      >
        {linkTypes.map(linkType => {
          return (
            <TreeViewMenu
              key={linkType}
              title={linkType}
              hideArrow={true}
              onClick={() => {
                this.props.togglePinnedConnectedNodesByLinkType(
                  current.id,
                  linkType
                );
              }}
            />
          );
        })}
      </TreeViewMenu>
    );
  }
  getModelMenu() {
    return <ModelContextMenu />;
  }
  getComponentNodeMenu() {
    return <ComponentNodeMenu />;
  }
  getConditionMenu() {
    return <ConditionContextMenu />;
  }
  getDataChainContextMenu() {
    return <DataChainContextMenu />;
  }
  getDefaultMenu() {
    var { state } = this.props;
    var graph = UIA.GetCurrentGraph(state);
    return (
      <TreeViewButtonGroup>
        <TreeViewGroupButton
          title={Titles.ClearMarked}
          onClick={() => {
            UIA.clearMarked();
          }}
          icon={"fa  fa-stop"}
        />
        <TreeViewGroupButton
          title={Titles.SelectAllConnected}
          onClick={() => {
            this.props.selectAllConnected(UIA.Visual(state, UIA.SELECTED_NODE));
          }}
          icon={"fa fa-arrows-alt"}
        />
        <TreeViewGroupButton
          title={Titles.SelectViewPackage}
          onClick={() => {
            this.props.selectAllInViewPackage(
              UIA.Visual(state, UIA.SELECTED_NODE)
            );
          }}
          icon={"fa fa-shopping-cart"}
        />
        <TreeViewGroupButton
          title={Titles.PinSelected}
          onClick={() => {
            this.props.pinSelected();
          }}
          icon={"fa fa-map-pin"}
        />
        <TreeViewGroupButton
          title={Titles.UnPinSelected}
          onClick={() => {
            this.props.unPinSelected();
          }}
          icon={"fa fa-houzz"}
        />
        <TreeViewGroupButton
          title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : "0"})`}
          onClick={() => {
            this.props.deleteAllSelected();
          }}
          icon={"fa fa-minus"}
        />
      </TreeViewButtonGroup>
    );
  }
  render() {
    var { state } = this.props;
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    };
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? "block" : "none";
    let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE)
      ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
      : null;
    let menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
    let menuitems = this.getMenuMode(menuMode);
    let defaultMenus = this.getDefaultMenu();
    return (
      <Draggable handle=".draggable-header">
        <div
          className="context-menu modal-dialog modal-info"
          style={{
            zIndex: 1000,
            position: "fixed",
            width: 250,
            display,
            top: 250,
            left: 500
          }}
        >
          <div className="modal-content">
            <div className="modal-header draggable-header">
              <button
                type="button"
                onClick={() => {
                  exit();
                }}
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <GenericPropertyContainer
                active={true}
                title="asdf"
                subTitle="afaf"
                nodeType={nodeType}
              >
                {defaultMenus}
                {menuitems}
              </GenericPropertyContainer>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  exit();
                }}
                className="btn btn-outline pull-left"
                data-dismiss="modal"
              >
                Close
              </button>
              {/* <button type="button" className="btn btn-outline">Save changes</button> */}
            </div>
          </div>
        </div>
      </Draggable>
    );
  }
}

export default UIConnect(ContextMenu);
