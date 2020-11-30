// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';

class OptionItemFormControl extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.OptionListItem);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var show_custom = currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UseCustomUIOption];

        var custom_options = UIA.NodesByType(state, UIA.NodeTypes.OptionCustom).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });

        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <CheckBox
                        label={Titles.UseCustomOption}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseCustomUIOption] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UseCustomUIOption,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {show_custom ? (<SelectInput
                        options={custom_options}
                        label={Titles.OptionsType}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIOptionTypeCustom],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIOptionTypeCustom,
                                id: currentNode.id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.OptionCustomLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIOptionTypeCustom] : ''} />) : (<SelectInput
                            options={Object.keys(UIA.OptionsTypes).sort((a, b) => a.localeCompare(b)).map(x => {
                                return {
                                    value: UIA.OptionsTypes[x],
                                    title: x
                                }
                            })}
                            label={Titles.OptionsType}
                            onChange={(value) => {
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.UIOptionType,
                                    id: currentNode.id,
                                    value
                                });
                            }}
                            value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIOptionType] : ''} />)}
                    {show_custom ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                this.props.graphOperation(UIA.NEW_CUSTOM_OPTION, {});
                            }} icon={'fa fa-puzzle-piece'}
                                title={Titles.AddOptionList}
                                description={Titles.AddOptionListDescription} />
                        </ControlSideBarMenu>) : null}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(OptionItemFormControl)
