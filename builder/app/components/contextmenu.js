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
  LinkPropertyKeys
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
import { getLinkInstance } from "../methods/graph_methods";
import SelectInput from "./selectinput";
import CheckBox from "./checkbox";
import CreateStandardClaimService from "../nodepacks/CreateStandardClaimService";
import GetModelViewModelForList from "../nodepacks/GetModelViewModelForList";
import AddButtonToComponent from "../nodepacks/AddButtonToComponent";
import GetScreenValueParameter from "../nodepacks/GetScreenValueParameter";
import ConnectDataChainToCompontApiConnector from "../nodepacks/ConnectDataChainToCompontApiConnector";
const DATA_SOURCE = "DATA_SOURCE";
class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getMenuMode(mode) {
    let result = [];
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
          case LinkType.ComponentExternalConnection:
          case LinkType.EventMethodInstance:
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
  operations() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);

    switch (currentNodeType) {
      case NodeTypes.ComponentApiConnector:
        let temp;
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
                    label={`Execute`}
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
        return [
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
              title={Titles.AddButtonToComponent}
              hideArrow={true}
              onClick={() => {
                this.props.graphOperation(
                  AddButtonToComponent({ component: currentNode.id })
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
      case NodeTypes.Condition:
        return this.getConditionMenu();
      case NodeTypes.Model:
        return this.getModelMenu();
      case NodeTypes.ViewType:
        return this.getViewTypes();
      case NodeTypes.ComponentExternalApi:
        return this.getComponentExternalMenu(currentNode);
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
    return (
      <TreeViewMenu
        open={true}
        active={true}
        title={Titles.ComponentAPIMenu}
        toggle={() => {}}
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
      </TreeViewMenu>
    );
  }
  getGenericComponentApiMenu(currentNode) {
    return (
      <TreeViewMenu
        open={true}
        active={true}
        title={Titles.ComponentAPIMenu}
        toggle={() => {}}
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
      </TreeViewMenu>
    );
  }
  getButtonEventMenu(currentNode) {
    switch (UIA.GetNodeProp(currentNode, NodeProperties.UIType)) {
      case UITypes.ReactNative:
        return (
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Events}
            toggle={() => {}}
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
            height: 400,
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
