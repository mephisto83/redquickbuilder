// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import * as UIA from "../actions/uiactions";
import * as Titles from "./titles";
import TopViewer from "./topviewer";
import Box from "./box";
import SelectInput from "./selectinput";
import { NodeTypes, NodeProperties } from "../constants/nodetypes";
import TextInput from "./textinput";
import {
  SetCellsLayout,
  GetCellProperties,
  FindLayoutRoot,
  RemoveCellLayout,
  GetConnectedNodesByType,
  CreateLayout,
  SOURCE,
  getComponentPropertyList,
  GetNodesLinkedTo,
  getComponentProperty,
  ReorderCellLayout
} from "../methods/graph_methods";

import ButtonList from "./buttonlist";
import CheckBox from "./checkbox";
import LayoutCreator from "./layoutcreator";
import { getComponentApiList } from "../methods/component_api_methods";
import {
  InstanceTypes,
  HandlerTypes,
  ComponentTags
} from "../constants/componenttypes";
import FormControl from "./formcontrol";
import { StyleLib } from "../constants/styles";

class LayoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  active() {
    return !!this.props.active;
  }
  getComponentApi(cellChildren) {
    let { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let nodeLayout = UIA.GetNodeProp(currentNode, NodeProperties.Layout);

    let selectedCell = this.state.selectedCell;
    if (cellChildren && cellChildren[selectedCell]) {
      let childComponent = cellChildren[selectedCell];
      let componentApi = UIA.GetNodeProp(
        UIA.GetNodeById(childComponent),
        NodeProperties.ComponentApi
      );
      if (componentApi) {
        let selectedComponentApiProperty = this.state.componentApi
          ? this.state.componentApi[selectedCell]
          : null;
        let cellProperties = GetCellProperties(
          nodeLayout,
          this.state.selectedCell
        );
        cellProperties.componentApi = cellProperties.componentApi || {};
        let {
          instanceType,
          model,
          selector,
          handlerType,
          dataChain,
          modelProperty
        } = cellProperties.componentApi[selectedComponentApiProperty] || {};
        let model_obj = UIA.GetNodeById(model);
        let temp_model = UIA.GetNodeProp(model_obj, UIA.NodeProperties.Model);
        let properties = GetNodesLinkedTo(UIA.GetRootGraph(state), {
          id: temp_model,
          direction: SOURCE
        }).toNodeSelect();
        return [
          <SelectInput
            label={Titles.ComponentAPIMenu}
            value={selectedComponentApiProperty}
            options={getComponentApiList(componentApi)}
            onChange={value => {
              this.setState({
                componentApi: {
                  ...(this.state.componentApi || {}),
                  [selectedCell]: value
                }
              });
            }}
          />,
          selectedComponentApiProperty &&
          instanceType === InstanceTypes.ScreenInstance ? (
            <SelectInput
              label={Titles.HandlerType}
              value={handlerType}
              options={Object.keys(HandlerTypes).map(t => ({
                title: t,
                value: HandlerTypes[t]
              }))}
              onChange={value => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty];
                let old = temp.handlerType;
                temp.handlerType = value;

                this.props.graphOperation([
                  {
                    operation: UIA.CHANGE_NODE_PROPERTY,
                    options: {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: nodeLayout
                    }
                  }
                ]);
              }}
            />
          ) : null,
          selectedComponentApiProperty ? (
            <SelectInput
              label={Titles.InstanceType}
              value={instanceType}
              options={Object.keys(InstanceTypes).map(t => ({
                title: t,
                value: InstanceTypes[t]
              }))}
              onChange={value => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty];
                temp.instanceType = value;
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.Layout,
                  id: currentNode.id,
                  value: nodeLayout
                });
              }}
            />
          ) : null,
          selectedComponentApiProperty &&
          instanceType === InstanceTypes.Selector ? (
            <SelectInput
              label={Titles.Selector}
              value={selector}
              options={UIA.NodesByType(
                state,
                NodeTypes.Selector
              ).toNodeSelect()}
              onChange={value => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let old = temp.selector;
                temp.selector = value;

                this.props.graphOperation([
                  {
                    operation: REMOVE_LINK_BETWEEN_NODES,
                    options: {
                      target: old,
                      source: currentNode.id
                    }
                  },
                  {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: {
                      target: value,
                      source: currentNode.id,
                      properties: {
                        ...UIA.LinkProperties.ComponentApi,
                        selector: true
                      }
                    }
                  },
                  {
                    operation: UIA.CHANGE_NODE_PROPERTY,
                    options: {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: nodeLayout
                    }
                  }
                ]);
              }}
            />
          ) : null,
          selectedComponentApiProperty &&
          instanceType === InstanceTypes.ScreenInstance ? (
            <SelectInput
              label={Titles.Models}
              value={model}
              options={UIA.NodesByType(
                state,
                NodeTypes.ViewModel
              ).toNodeSelect()}
              onChange={value => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let old = temp.model;
                temp.model = value;

                this.props.graphOperation([
                  {
                    operation: REMOVE_LINK_BETWEEN_NODES,
                    options: {
                      target: old,
                      source: currentNode.id
                    }
                  },
                  {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: {
                      target: value,
                      source: currentNode.id,
                      properties: {
                        ...UIA.LinkProperties.ComponentApi,
                        model: true
                      }
                    }
                  },
                  {
                    operation: UIA.CHANGE_NODE_PROPERTY,
                    options: {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: nodeLayout
                    }
                  }
                ]);
              }}
            />
          ) : null,
          selectedComponentApiProperty &&
          instanceType === InstanceTypes.ScreenInstance ? (
            <SelectInput
              options={properties}
              onChange={val => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let old = temp.modelProperty;
                temp.modelProperty = val;

                this.props.graphOperation([
                  {
                    operation: REMOVE_LINK_BETWEEN_NODES,
                    options: {
                      target: old,
                      source: currentNode.id
                    }
                  },
                  {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: {
                      target: value,
                      source: currentNode.id,
                      properties: {
                        ...UIA.LinkProperties.ComponentApi,
                        modelProperty: true
                      }
                    }
                  },
                  {
                    operation: UIA.CHANGE_NODE_PROPERTY,
                    options: {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: nodeLayout
                    }
                  }
                ]);
              }}
              label={Titles.Property}
              value={modelProperty}
            />
          ) : null,
          selectedComponentApiProperty ? (
            <SelectInput
              options={UIA.GetDataChainEntryNodes().toNodeSelect()}
              onChange={val => {
                cellProperties.componentApi[selectedComponentApiProperty] =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let temp =
                  cellProperties.componentApi[selectedComponentApiProperty] ||
                  {};
                let id = currentNode.id;
                this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                  target: temp.dataChain,
                  source: id,
                  properties: {
                    cell: selectedCell,
                    selectedComponentApiProperty
                  }
                });
                temp.dataChain = val;
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.Layout,
                  id: currentNode.id,
                  value: nodeLayout
                });
                if (val) {
                  this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                    target: val,
                    source: id,
                    properties: {
                      ...UIA.LinkProperties.DataChainLink,
                      cell: selectedCell,
                      selectedComponentApiProperty
                    }
                  });
                }
              }}
              label={Titles.DataChain}
              value={dataChain}
            />
          ) : null
        ].filter(x => x);
      }
    }

    return null;
  }
  render() {
    var { state } = this.props;
    let active = this.active();

    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let componentNodes = currentNode
      ? GetConnectedNodesByType(
          state,
          currentNode.id,
          NodeTypes.ComponentNode,
          SOURCE
        )
      : [];
    componentNodes = [
      ...componentNodes,
      ...UIA.GetNodesByProperties(
        {
          [NodeProperties.NODEType]: NodeTypes.ComponentNode,
          [NodeProperties.SharedComponent]: true
        },
        null,
        state
      ),
      ...UIA.GetNodesByProperties(
        {
          [NodeProperties.NODEType]: NodeTypes.ViewType
        },
        null,
        state
      )
    ];
    let namespace = "namespace";
    let nodeLayout = UIA.GetNodeProp(currentNode, NodeProperties.Layout);
    let cellProperties;
    let cellStyle = null;
    let cellChildren = null;
    let cellModel = null;
    let cellModelProperty = null;
    let cellRoot = null;
    let cellEvents = null;
    let selectedLayoutRoot = null;
    if (nodeLayout && this.state.selectedCell) {
      cellProperties = GetCellProperties(nodeLayout, this.state.selectedCell);
      if (cellProperties) {
        cellStyle = cellProperties.style;
        cellProperties.children = cellProperties.children || {};
        cellProperties.name = cellProperties.name || {};
        cellChildren = cellProperties.children;
        cellProperties.cellModel = cellProperties.cellModel || {};
        cellModel = cellProperties.cellModel;

        cellProperties.properties = cellProperties.properties || {};
        cellProperties.cellModelProperty =
          cellProperties.cellModelProperty || {};
        cellModelProperty = cellProperties.cellModelProperty;

        cellProperties.cellRoot = cellProperties.cellRoot || {};
        cellRoot = cellProperties.cellRoot;

        cellProperties.cellEvents = cellProperties.cellEvents || {};
        cellEvents = cellProperties.cellEvents;
      }
      selectedLayoutRoot =
        FindLayoutRoot(this.state.selectedCell, nodeLayout.layout) ||
        nodeLayout.layout;
    }
    let componentProperties = UIA.GetNodeProp(
      currentNode,
      UIA.NodeProperties.ComponentProperties
    );
    let componentPropertiesList = getComponentPropertyList(componentProperties);
    return (
      <TopViewer active={active}>
        <section className="content">
          <div className="row">
            <div className="col-md-2">
              <div className="btn-group">
                <button
                  type="button"
                  onClick={() => {
                    let layout =
                      UIA.GetNodeProp(currentNode, NodeProperties.Layout) ||
                      CreateLayout();
                    layout = ReorderCellLayout(layout, this.state.selectedCell);
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: layout
                    });
                  }}
                  className="btn btn-default btn-flat"
                >
                  <i className="fa  fa-angle-left" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let layout =
                      UIA.GetNodeProp(currentNode, NodeProperties.Layout) ||
                      CreateLayout();
                    layout = ReorderCellLayout(
                      layout,
                      this.state.selectedCell,
                      1
                    );
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: layout
                    });
                  }}
                  className="btn btn-default btn-flat"
                >
                  <i className="fa fa-angle-right" />
                </button>
              </div>
              <Box primary={true} maxheight={350} title={Titles.Layout}>
                {this.state.selectedCell ? (
                  <button
                    onClick={() => {
                      let layout =
                        UIA.GetNodeProp(currentNode, NodeProperties.Layout) ||
                        CreateLayout();
                      layout = RemoveCellLayout(
                        layout,
                        this.state.selectedCell
                      );
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                      this.setState({ selectedCell: null });
                    }}
                  >
                    Remove Selected
                  </button>
                ) : null}
                <SelectInput
                  options={[].interpolate(1, 12, t => ({ title: t, value: t }))}
                  onChange={val => {
                    let layout =
                      UIA.GetNodeProp(currentNode, NodeProperties.Layout) ||
                      CreateLayout();
                    layout = SetCellsLayout(
                      layout,
                      val,
                      this.state.selectedCell
                    );
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                      prop: UIA.NodeProperties.Layout,
                      id: currentNode.id,
                      value: layout
                    });
                  }}
                  label={Titles.Sections}
                  value={Object.keys(selectedLayoutRoot || {}).length}
                />
                {cellProperties &&
                cellProperties.name &&
                this.state.selectedCell ? (
                  <TextInput
                    immediate={true}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      if (!cellProperties.name !== "object") {
                        cellProperties.name = {};
                      }

                      cellProperties.name[this.state.selectedCell] = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Name}
                    value={cellProperties.name[this.state.selectedCell]}
                  />
                ) : null}
                {cellStyle ? (
                  <SelectInput
                    options={["column", "row"].map(t => ({
                      title: t,
                      value: t
                    }))}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      cellStyle.flexDirection = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.FlexDirection}
                    value={cellStyle.flexDirection}
                  />
                ) : null}

                {cellStyle ? (
                  <SelectInput
                    options={[].interpolate(0, 12, t => ({
                      title: t,
                      value: t
                    }))}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      if (!parseInt(val)) cellStyle.flex = null;
                      else cellStyle.flex = parseInt(val);
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Flex}
                    value={cellStyle.flex}
                  />
                ) : null}
                {cellStyle ? (
                  <SelectInput
                    options={[
                      "flex-start",
                      "flex-end",
                      "center",
                      "space-between"
                    ].map(t => ({ title: t, value: t }))}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();

                      cellStyle.justifyContent = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={"justify-content"}
                    value={cellStyle.justifyContent}
                  />
                ) : null}
                {cellStyle ? (
                  <SelectInput
                    options={[
                      "flex-start",
                      "flex-end",
                      "center",
                      "stretch"
                    ].map(t => ({ title: t, value: t }))}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();

                      cellStyle.alignItems = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={"align-items"}
                    value={cellStyle.alignItems}
                  />
                ) : null}
                {cellStyle ? (
                  <TextInput
                    immediate={true}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      let percentage = 0;
                      if ((val || "").indexOf("%") !== -1) {
                        percentage = "%";
                      }
                      cellStyle.height =
                        val === "" ? null : `${parseInt(val) + percentage}`;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Height}
                    value={cellStyle.height}
                  />
                ) : null}
                {cellStyle ? (
                  <TextInput
                    immediate={true}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      let percentage = 0;
                      if ((val || "").indexOf("%") !== -1) {
                        percentage = "%";
                      }

                      cellStyle.width =
                        val === "" ? null : `${parseInt(val) + percentage}`;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Width}
                    value={cellStyle.width}
                  />
                ) : null}
                {cellChildren ? (
                  <SelectInput
                    options={componentNodes.toNodeSelect()}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      cellChildren[this.state.selectedCell] = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Component}
                    value={cellChildren[this.state.selectedCell]}
                  />
                ) : null}
                {cellChildren && cellChildren[this.state.selectedCell]
                  ? this.getComponentApi(cellChildren)
                  : null}
                {cellChildren && cellChildren[this.state.selectedCell] ? (
                  <CheckBox
                    label={Titles.UseAsRoot}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      cellRoot[this.state.selectedCell] = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    value={cellRoot[this.state.selectedCell]}
                  />
                ) : null}

                {cellChildren &&
                cellChildren[this.state.selectedCell] &&
                componentPropertiesList &&
                componentPropertiesList.length ? (
                  <SelectInput
                    options={componentPropertiesList}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      cellModel[this.state.selectedCell] = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Models}
                    value={cellModel[this.state.selectedCell]}
                  />
                ) : null}
                {cellModel &&
                cellModel[this.state.selectedCell] &&
                componentPropertiesList &&
                componentPropertiesList.length ? (
                  <SelectInput
                    options={GetNodesLinkedTo(UIA.GetRootGraph(state), {
                      id: getComponentProperty(
                        componentProperties,
                        cellModel[this.state.selectedCell]
                      ),
                      direction: SOURCE
                    }).toNodeSelect()}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();
                      cellModelProperty[this.state.selectedCell] = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.Property}
                    value={cellModelProperty[this.state.selectedCell]}
                  />
                ) : null}
              </Box>
              <Box maxheight={350} title={Titles.Properties}>
                {cellProperties && cellProperties.properties ? (
                  <SelectInput
                    options={["Content", "Container", "View"].map(t => ({
                      title: t,
                      value: t
                    }))}
                    onChange={val => {
                      let layout = nodeLayout || CreateLayout();

                      cellProperties.properties.componentType = val;
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                    label={Titles.ComponentType}
                    value={cellProperties.properties.componentType}
                  />
                ) : null}
                {cellProperties && cellProperties.properties ? (
                  <ButtonList
                    active
                    isSelected={item => {
                      if (cellProperties.properties) {
                        return (cellProperties.properties.tags || []).some(
                          v => v === item.value
                        );
                      }
                      return false;
                    }}
                    items={Object.keys(ComponentTags).map(x => ({
                      id: x,
                      value: x,
                      title: x
                    }))}
                    onClick={item => {
                      let layout =
                        UIA.GetNodeProp(currentNode, NodeProperties.Layout) ||
                        CreateLayout();

                      cellProperties.properties.tags =
                        cellProperties.properties.tags || [];
                      if (
                        cellProperties.properties.tags.find(
                          v => v === item.value
                        )
                      ) {
                        let index = cellProperties.properties.tags.findIndex(
                          v => v === item.value
                        );
                        cellProperties.properties.tags.splice(index, 1);
                      } else {
                        cellProperties.properties.tags.push(item.value);
                      }
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }}
                  />
                ) : null}
              </Box>
              <Box maxheight={500} title={Titles.Style}>
                <FormControl>
                  <TextInput
                    value={this.state.filter}
                    immediate={true}
                    onChange={value => {
                      this.setState({ filter: value });
                    }}
                    placeholder={Titles.Filter}
                  />
                </FormControl>
                {this.getStyleSelect()}
                {cellStyle
                  ? this.selectedStyle(value => {
                      cellStyle[this.state.selectedStyleKey] = value;
                      let layout = nodeLayout || CreateLayout();
                      this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.Layout,
                        id: currentNode.id,
                        value: layout
                      });
                    }, cellStyle[this.state.selectedStyleKey])
                  : null}
                {cellStyle ? this.getCurrentStyling(cellStyle) : null}
              </Box>
            </div>
            <div className="col-md-10">
              <LayoutCreator
                selectedCell={this.state.selectedCell}
                layout={UIA.GetNodeProp(currentNode, NodeProperties.Layout)}
                onSelectionClick={item => {
                  this.setState({
                    selectedCell: this.state.selectedCell !== item ? item : null
                  });
                }}
                style={{ height: 500 }}
              />
            </div>
          </div>
        </section>
      </TopViewer>
    );
  }
  selectedStyle(callback, value) {
    if (this.state.selectedStyleKey) {
      switch (this.state.selectedStyleKey) {
        default:
          return (
            <FormControl>
              <TextInput
                value={value}
                label={this.state.selectedStyleKey}
                immediate={true}
                onChange={callback}
                placeholder={Titles.Filter}
              />
            </FormControl>
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

export default UIConnect(LayoutView);
