// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import SideMenuContainer from './sidemenucontainer';
import FormControl from './formcontrol';
import TextBox from './textinput';
import { ExcludeDefaultNode } from '../constants/nodetypes';
import { PARAMETER_TAB } from './dashboard';

class CommonActivityMenu extends Component<any, any> {
  render() {
    const { state } = this.props;
    const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    const active = !ExcludeDefaultNode[UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType)];
    return (
      <SideMenuContainer active={active} tab={PARAMETER_TAB} visual="common-activty+menu" title={Titles.CommonProperties}>
        <TabPane active={active}>
          {currentNode ? (<FormControl>
            <TextBox
              label={Titles.CodeName}
              disabled={!UIA.CanChangeType(currentNode)}
              value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.CodeName] : ''}
              onChange={(value) => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.CodeName,
                  id: currentNode.id,
                  value
                });
              }} />
            <TextBox
              label={Titles.ValueName}
              disabled={!UIA.CanChangeType(currentNode)}
              value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValueName] : ''}
              onChange={(value) => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.ValueName,
                  id: currentNode.id,
                  value
                });
              }} />
            <TextBox
              label={Titles.AgentName}
              disabled={!UIA.CanChangeType(currentNode)}
              value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.AgentName] : ''}
              onChange={(value) => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: UIA.NodeProperties.AgentName,
                  id: currentNode.id,
                  value
                });
              }} />
            <TextBox
              label={Titles.HttpRoute}
              value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.HttpRoute)}
              onChange={(value) => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  id: currentNode.id,
                  value,
                  prop: UIA.NodeProperties.HttpRoute
                })
              }} />
          </FormControl>) : null}
        </TabPane>
      </SideMenuContainer>
    );
  }
}

export default UIConnect(CommonActivityMenu)
