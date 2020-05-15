// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes, ConfigurationProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { TARGET, GetLinkChain, SOURCE, GetNode } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import TextInput from './textinput';
class ConfigurationActivityMenu extends Component<any, any> {
  render() {
    var { state } = this.props;
    var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Configuration);
    if (!active) {
			return <div />;
		}
    var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
    var graph = UIA.GetCurrentGraph(state);
    let appSettingComponents = [];
    let appSettings;
    if (graph) {
      appSettings = UIA.GetAppSettings(graph);

      appSettingComponents = Object.keys(appSettings || {}).map(key => {
        if (typeof appSettings[key] === 'boolean') {
          <CheckBox
            label={key}
            key={key}
            value={appSettings[key]}
            onChange={(value) => {
              this.props.graphOperation(UIA.CHANGE_APP_SETTINGS, {
                prop: key,
                value: value
              });
            }} />
        }
        return (<TextInput
          label={key}
          key={key}
          value={appSettings[key]}
          onChange={(value) => {
            this.props.graphOperation(UIA.CHANGE_APP_SETTINGS, {
              prop: key,
              value: value
            });
          }} />
        );
      })
    }
    return (
      <TabPane active={active} style={{ maxHeight: 400, overflow: 'auto' }}>
        <CheckBox
          label={Titles.UseHttps}
          value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseHttps)}
          onChange={(value) => {
            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
              prop: UIA.NodeProperties.UseHttps,
              id: currentNode.id,
              value
            });
          }} />
        {
          Object.keys(ConfigurationProperties).map(key => {
            return (<TextInput
              label={key}
              key={`${key}-asdf`}
              value={UIA.GetNodeProp(currentNode, key)}
              onChange={(value) => {
                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                  prop: key,
                  id: currentNode.id,
                  value: value
                });
              }} />
            );
          })
        }
        {appSettingComponents}
      </TabPane>
    );
  }
}

export default UIConnect(ConfigurationActivityMenu)
