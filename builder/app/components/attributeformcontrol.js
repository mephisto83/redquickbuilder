// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';

class AttributeFormControl extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Attribute);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var choice_nodes = UIA.NodesByType(state, UIA.NodeTypes.ChoiceList).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var validation_nodes = UIA.NodesByType(state, UIA.NodeTypes.ValidationList).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var show_choice = currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UIAttributeType] == UIA.NodeAttributePropertyTypes.CHOICE;
        var show_validations = UIA.Use(currentNode, UIA.NodeProperties.UseUIValidations);
        var show_options = UIA.Use(currentNode, UIA.NodeProperties.UseUIOptions);
        var show_extenions = UIA.Use(currentNode, UIA.NodeProperties.UseUIExtensionList);
        var option_nodes = UIA.NodesByType(state, UIA.NodeTypes.OptionList).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        var extension_nodes = UIA.NodesByType(state, UIA.NodeTypes.ExtensionType).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
        
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <TextInput
                        label={Titles.UIName}
                        title={Titles.UINameDescription}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIName,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <SelectInput
                        options={Object.keys(UIA.NodeAttributePropertyTypes).sort((a, b) => a.localeCompare(b)).map(x => {
                            return {
                                value: UIA.NodeAttributePropertyTypes[x],
                                title: x
                            }
                        })}
                        label={Titles.PropertyValueType}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIAttributeType,
                                id: currentNode.id,
                                value
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIAttributeType] : ''} />
                    {show_choice ? (<SelectInput
                        label={Titles.ChoiceTypes}
                        options={choice_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIChoiceType],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIChoiceType,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ChoiceLink }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIChoiceType] : ''} />) : null}
                    {show_choice ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                this.props.graphOperation(UIA.NEW_CHOICE_TYPE, {});
                            }} icon={'fa fa-puzzle-piece'}
                                title={Titles.AddChoice}
                                description={Titles.AddChoiceDescription} />
                        </ControlSideBarMenu>
                    ) : null}
                    <CheckBox
                        label={Titles.UISingular}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UISingular] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UISingular,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <CheckBox
                        label={Titles.UseUIValidations}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseUIValidations] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UseUIValidations,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {show_validations ? (<SelectInput
                        label={Titles.ValidationTypes}
                        options={validation_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIValidationType],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIValidationType,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ValdationLink }
                            })
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIValidationType] : ''} />) : null}
                    {show_validations ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                this.props.graphOperation(UIA.NEW_VALIDATION_TYPE, {});
                            }} icon={'fa fa-puzzle-piece'}
                                title={Titles.AddValidationList}
                                description={Titles.AddValidationListDescription} />
                        </ControlSideBarMenu>
                    ) : null}
                    <CheckBox
                        label={Titles.UseUIOptions}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseUIOptions] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UseUIOptions,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    {show_options ? (<SelectInput
                        label={Titles.OptionsType}
                        options={option_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIOptionType],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIOptionType,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.OptionLink }
                            })
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIOptionType] : ''} />) : null}
                    {show_options ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                this.props.graphOperation(UIA.NEW_OPTION_NODE, {});
                            }} icon={'fa fa-puzzle-piece'}
                                title={Titles.AddOptionList}
                                description={Titles.AddOptionListDescription} />
                        </ControlSideBarMenu>
                    ) : null}


                    <CheckBox
                        label={Titles.UseUIExtensions}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseUIExtensionList] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UseUIExtensionList,
                                id: currentNode.id,
                                value
                            });
                        }} />

                    {show_extenions ? (<SelectInput
                        label={Titles.ExtensionTypes}
                        options={extension_nodes}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.UIExtensionList],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIExtensionList,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ExtensionLink }
                            })
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIExtensionList] : ''} />) : null}
                    {show_extenions ? (
                        <ControlSideBarMenu>
                            <ControlSideBarMenuItem onClick={() => {
                                this.props.graphOperation(UIA.NEW_EXTENSION_LIST_NODE, {});
                            }} icon={'fa fa-puzzle-piece'}
                                title={Titles.AddExtensionList}
                                description={Titles.AddExtensionListDescription} />
                        </ControlSideBarMenu>
                    ) : null}
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(AttributeFormControl)