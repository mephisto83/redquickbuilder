// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import FormControl from './formcontrol';
import CheckBoxProperty from './checkboxproperty';
import { ViewTypes } from '../constants/viewtypes';

class AgentAccessProperties extends Component {
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
          title={ViewTypes.GetAll}
          node={currentNode}
          property={ViewTypes.GetAll} />
        <CheckBoxProperty
          title={ViewTypes.Get}
          node={currentNode}
          property={ViewTypes.Get} />
        <CheckBoxProperty
          title={ViewTypes.Create}
          node={currentNode}
          property={ViewTypes.Create} />
        <CheckBoxProperty
          title={ViewTypes.Update}
          node={currentNode}
          property={ViewTypes.Update} />
        <CheckBoxProperty
          title={ViewTypes.Delete}
          node={currentNode}
          property={ViewTypes.Delete} />
      </FormControl>
    );
  }
}

export default UIConnect(AgentAccessProperties)
