// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';

class PermissionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Permission);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var is_agent = UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsAgent);
        var permissions = currentNode ? currentNode.properties[UIA.NodeProperties.UIPermissions] || {
            create: false,
            get: false,
            update: false,
            delete: false,
            getall: false,
        } : null;
        var model_nodes = UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.PermissionAttributes} />
               {currentNode ? (<CheckBox 
                    title={Titles.OwnedResourcesDescription}
                    label={Titles.OwnedResources}
                    value={currentNode.properties[UIA.NodeProperties.IsOwned] }
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.IsOwned,
                            id: currentNode.id,
                            value
                        });
                    }} />) : null}
                <ControlSideBarMenuHeader title={Titles.PermissionActions} />
                {permissions ? (<FormControl>{(Object.keys(permissions).map(key => {
                    return (<CheckBox key={`permissions-${key}`}
                        label={Titles.Permissions[key]}
                        value={permissions[key]}
                        onChange={(value) => {
                            permissions[key] = value;
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIPermissions,
                                id: currentNode.id,
                                value: { ...permissions }
                            });
                        }} />);
                }))}</FormControl>) : null}
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                {currentNode ? (<SelectInput
                    label={Titles.Models}
                    options={model_nodes}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.AppliedPermissionLink }
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIPermissions] : ''} />) : null}
            </TabPane>
        );
    }
}

export default UIConnect(PermissionActivityMenu)