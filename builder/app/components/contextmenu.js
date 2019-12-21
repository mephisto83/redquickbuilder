// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import Draggable from 'react-draggable'; // The default
import TabPane from './tabpane';
import SideBarHeader from './sidebarheader';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes, FilterUI, LAYOUT_VIEW, MAIN_CONTENT, MIND_MAP, CODE_VIEW, UITypes } from '../constants/nodetypes';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import Box from './box';
import { TARGET, GetLinkChain, SOURCE, GetNode, createExecutor, addMethodValidationForParamter, getMethodValidationForParameter, createValidator, removeMethodValidationParameter } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import GenericPropertyMenu from './genericpropertymenu';
import GenericPropertyContainer from './genericpropertycontainer';
import TextInput from './textinput';
import ButtonList from './buttonlist';
import ModelContextMenu from './modelcontextmenu';
import ComponentNodeMenu from './componentnodemenu';
import SideBarMenu from './sidebarmenu';
import ConditionContextMenu from './conditioncontextmenu';
import TreeViewMenu from './treeviewmenu';
import DataChainContextMenu from './datachaincontextmenu';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';
import ViewTypeMenu from './viewtypecontextmenu';
import { ComponentTypes } from '../constants/componenttypes';
const DATA_SOURCE = 'DATA_SOURCE';
class ContextMenu extends Component {
  getMenuMode(mode) {
    let result = [];
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    }
    switch (mode) {
      case 'layout':
        result.push((
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Layout}
            toggle={() => {
            }}>
            <TreeViewMenu title={Titles.Layout} hideArrow={true} icon={'fa fa-taxi'} key={'layoutview'} onClick={() => {
              this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
              exit();
            }} />
            <TreeViewMenu title={Titles.MindMap} hideArrow={true} icon={'fa fa-taxi'} key={'mindmap'} onClick={() => {
              this.props.setVisual(MAIN_CONTENT, MIND_MAP);
              exit();
            }} />
            <TreeViewMenu title={Titles.CodeView} hideArrow={true} icon={'fa fa-taxi'} key={'codeview'} onClick={() => {
              this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
              exit();
            }} /></TreeViewMenu>))
        break;
      default:
        result.push(this.getContextMenu())
        break;
    }
    result.push(...this.eventMenu());
    result.push(this.minimizeMenu());
    result.push(this.hideTypeMenu());
    return result.filter(x => x);
  }
  hideTypeMenu() {
    let HIDE_TYPE_MENU = 'HIDE_TYPE_MENU';
    let { state } = this.props;
    return (
      <TreeViewMenu open={UIA.Visual(state, HIDE_TYPE_MENU)}
        active={true}
        title={Titles.HideTypeMenu}
        innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
        toggle={() => {
          this.props.toggleVisual(HIDE_TYPE_MENU);
        }}>
        {Object.keys(NodeTypes).sort().map(type => {
          return (
            <TreeViewMenu key={`node-${type}`}
              hideArrow={true}
              title={type}
              icon={UIA.Hidden(state, NodeTypes[type]) ? "fa fa-circle-o" : 'fa fa-check-circle-o'}
              toggle={() => {
                this.props.toggleHideByTypes(NodeTypes[type]);
              }}>
            </TreeViewMenu>)
        })}
      </TreeViewMenu>
    )
  }
  minimizeMenu() {
    let MINIMIZE_MENU = 'MINIMIZE_MENU';
    let { state } = this.props;
    return (
      <TreeViewMenu open={UIA.Visual(state, MINIMIZE_MENU)}
        active={true}
        title={Titles.MinimizeTypeMenu}
        innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
        toggle={() => {
          this.props.toggleVisual(MINIMIZE_MENU);
        }}>
        {Object.keys(NodeTypes).sort().map(type => {
          return (
            <TreeViewMenu key={`node-${type}`}
              hideArrow={true}
              title={type}
              icon={!UIA.Minimized(state, NodeTypes[type]) ? "fa fa-circle-o" : 'fa fa-check-circle-o'}
              toggle={() => {
                this.props.toggleMinimized(NodeTypes[type]);
              }}>
            </TreeViewMenu>)
        })}
      </TreeViewMenu>
    )
  }
  eventMenu() {
    var { state } = this.props;
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
    switch (currentNodeType) {
      case NodeTypes.ComponentNode:
        let componentType = UIA.GetNodeProp(currentNode, NodeProperties.ComponentType);
        switch (componentType) {
          case 'Button':
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
      case NodeTypes.DataChain:
        return this.getDataChainContextMenu();
      case NodeTypes.Condition:
        return this.getConditionMenu();
      case NodeTypes.Model:
        return this.getModelMenu();
        return this.getComponentNodeMenu();
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
    return <ViewTypeMenu />
  }
  getButtonEventMenu(currentNode) {
    switch (UIA.GetNodeProp(currentNode, NodeProperties.UIType)) {
      case UITypes.ReactNative:
        return (
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Events}
            toggle={() => {
            }}>
            <TreeViewMenu title={`${Titles.Add} onPress`} hideArrow={true} onClick={() => {
              this.props.addComponentEventTo(currentNode.id, 'onPress');
            }} />
          </TreeViewMenu>);
        break;
      case UITypes.ElectronIO:
        return (
          <TreeViewMenu
            open={true}
            active={true}
            title={Titles.Events}
            toggle={() => {
            }}>
            <TreeViewMenu title={`${Titles.Add} onClick`} hideArrow={true} onClick={() => {
              this.props.addComponentEventTo(currentNode.id, 'onClick');
            }} />
          </TreeViewMenu>);
        break;
    }
  }
  getComponentExternalMenu(currentNode) {
    return (
      <TreeViewMenu
        open={true}
        active={true}
        title={Titles.Select}
        toggle={() => {
        }}>
        <TreeViewMenu title={LinkType.ComponentExternalConnection} hideArrow={true} onClick={() => {
          this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.ComponentExternalConnection);
        }} />
        <TreeViewMenu title={LinkType.SelectorLink} hideArrow={true} onClick={() => {
          this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.SelectorLink);
        }} />
        <TreeViewMenu title={LinkType.DataChainLink} hideArrow={true} onClick={() => {
          this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.DataChainLink);
        }} />
      </TreeViewMenu>);
  }
  getGenericLinks(current) {
    if (!current || !current.id) { return [] }
    var linkTypes = UIA.GetNodesLinkTypes(current.id);
    return (
      <TreeViewMenu
        open={true}
        active={true}
        title={Titles.Select}
        toggle={() => {
        }}>
        {linkTypes.map(linkType => {
          return (<TreeViewMenu key={linkType} title={linkType} hideArrow={true} onClick={() => {
            this.props.togglePinnedConnectedNodesByLinkType(current.id, linkType);
          }} />)
        })}

      </TreeViewMenu>);
  }
  getModelMenu() {
    return <ModelContextMenu />;
  }
  getComponentNodeMenu() {
    return <ComponentNodeMenu />;
  }
  getConditionMenu() {
    return <ConditionContextMenu />
  }
  getDataChainContextMenu() {
    return <DataChainContextMenu />
  }
  getDefaultMenu() {
    var { state } = this.props;
    var graph = UIA.GetCurrentGraph(state);
    return (<TreeViewButtonGroup>
      <TreeViewGroupButton title={Titles.ClearMarked} onClick={() => {
        UIA.clearMarked();
      }} icon={'fa  fa-stop'} />
      <TreeViewGroupButton
        title={Titles.SelectAllConnected}
        onClick={() => {
          this.props.selectAllConnected(UIA.Visual(state, UIA.SELECTED_NODE))
        }} icon={'fa fa-arrows-alt'} />
      <TreeViewGroupButton
        title={Titles.SelectViewPackage}
        onClick={() => {
          this.props.selectAllInViewPackage(UIA.Visual(state, UIA.SELECTED_NODE))
        }} icon={'fa fa-shopping-cart'} />
      <TreeViewGroupButton
        title={Titles.PinSelected}
        onClick={() => {
          this.props.pinSelected()
        }} icon={'fa fa-map-pin'} />
      <TreeViewGroupButton
        title={Titles.UnPinSelected}
        onClick={() => {
          this.props.unPinSelected()
        }} icon={'fa fa-houzz'} />
      <TreeViewGroupButton
        title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : '0'})`}
        onClick={() => {
          this.props.deleteAllSelected();
        }} icon={'fa fa-minus'} />

    </TreeViewButtonGroup>)
  }
  render() {
    var { state } = this.props;
    let exit = () => {
      this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
    }
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    let display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? 'block' : 'none';
    let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType) : null;
    let menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
    let menuitems = this.getMenuMode(menuMode);
    let defaultMenus = this.getDefaultMenu();
    return (<Draggable handle=".draggable-header">
      <div className="context-menu modal-dialog modal-info" style={{ zIndex: 1000, position: 'fixed', width: 250, height: 400, display, top: 250, left: 500 }}>
        <div className="modal-content">
          <div className="modal-header draggable-header">
            <button type="button" onClick={() => {
              exit();
            }} className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span></button>
          </div>
          <div className="modal-body" style={{ padding: 0 }}>
            <GenericPropertyContainer active={true} title='asdf' subTitle='afaf' nodeType={nodeType} >
              {defaultMenus}
              {menuitems}
            </GenericPropertyContainer>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => {
              exit();
            }} className="btn btn-outline pull-left" data-dismiss="modal">Close</button>
            {/* <button type="button" className="btn btn-outline">Save changes</button> */}
          </div>
        </div>
      </div>
    </Draggable>)
  }
}

export default UIConnect(ContextMenu)
