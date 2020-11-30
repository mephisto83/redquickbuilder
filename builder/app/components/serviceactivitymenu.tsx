// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { Iterator } from 'webcola';
import { ServiceTypes, ServiceTypeSetups } from '../constants/servicetypes';
class ServiceActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Services);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let serviceType = currentNode ? UIA.GetNodeProp(currentNode, NodeProperties.ServiceType) : '';
        let propinputs = [];
        if (serviceType) {
            let serviceTypeSetup = ServiceTypeSetups[serviceType];
            if (serviceTypeSetup && serviceTypeSetup.properties) {
                Object.keys(serviceTypeSetup.properties).map(prop => {
                    var prop_setup = serviceTypeSetup.properties[prop];
                    var value = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ServiceTypeSettings) || {};
                    if (prop_setup && prop_setup.type) {
                        switch (prop_setup.type) {
                            case 'string':
                                propinputs.push(<TextInput
                                    key={`service-type${prop}`}
                                    onChange={(val) => {
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.ServiceTypeSettings,
                                            id: currentNode.id,
                                            value: { ...value, [prop]: val }
                                        });
                                    }}
                                    label={prop.unCamelCase()}
                                    value={value[prop] || ''} />)
                                break;
                            case 'boolean':
                                    propinputs.push(<CheckBox
                                        key={`service-type${prop}`}
                                        onChange={(val) => {
                                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                prop: UIA.NodeProperties.ServiceTypeSettings,
                                                id: currentNode.id,
                                                value: { ...value, [prop]: val }
                                            });
                                        }}
                                        label={prop.unCamelCase()}
                                        value={value[prop] || ''} />)
                                break;
                        }
                    }
                })
            }
        }
        return (
            <TabPane active={active}>
                <FormControl>
                    <SelectInput
                        label={Titles.ServiceActivity}
                        options={Object.keys(ServiceTypes).map(t => {
                            return { title: t, value: ServiceTypes[t] }
                        })}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ServiceType,
                                id: currentNode.id,
                                value
                            });
                        }}
                        value={serviceType} />
                        {propinputs}
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(ServiceActivityMenu)
