// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import FormControl from './formcontrol';
import CheckBoxProperty from './checkboxproperty';
import { ViewTypes } from '../constants/viewtypes';

class AgentAccessProperties extends Component<any, any> {
  render() {
    const { state } = this.props;
    const active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.AgentAccessDescription);
    const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    if (!active) {
      return <div style={{ display: 'none' }} />
    }
    return (
      <FormControl>
        <h3>Agent Access</h3>
        <CheckBoxProperty
          title={ViewTypes}
          node={currentNode}
          property={ViewTypes.GetAll} />
      </FormControl>
    );
  }
}

export default UIConnect(AgentAccessProperties)
