// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import SelectInput from './selectinput';
class ExtensionListActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionTypeList);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));


        var extentiontypes = UIA.NodesByType(state, UIA.NodeTypes.ExtensionType).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });

        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <SelectInput
                        options={extentiontypes}
                        label={Titles.ExtensionOptions}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIExtension],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIExtension,
                                id: currentNode.id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ExtensionLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIExtension] : ''} />
                </FormControl>) : null}
                <ControlSideBarMenuHeader title={Titles.ExtensionListTypeActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_EXTENTION_NODE, {
                        });
                    }}
                        icon={'fa fa-puzzle-piece'}
                        title={Titles.AddExtensionNode}
                        description={Titles.AddExtensionNodeDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(ExtensionListActivityMenu)
