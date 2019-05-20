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
import DropDownMenu from './dropdown';
import Box from './box';
import Tabs from './tabs';
import Tab from './tab';
import TabContent from './tabcontent';
import UserFooter from './userfooter';
import TabContainer from './tabcontainer';
import EnumeratedTable from './enumeratedtable';

import { createExtensionDefinition, defaultExtensionDefinitionType } from '../methods/graph_methods';
const EXTENSION_DEFINITION_MENU = 'EXTENSION_DEFINITION_MENU';
const EDITMODE = 'EDITMODE';
class ExtensionDefinitionMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            property: ''
        }
    }
    form() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (active) {
            var def = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIExtensionDefinition);
            if (def) {

            }

        }
        return null;
    }
    editKey(k) {
        return `${k}-edit`
    }
    tabKey(k) {
        return `${k}-tabkey`;
    }
    footer() {
        //
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (active && currentNode) {
            if (UIA.VisualEq(state, this.editKey(currentNode.id), EDITMODE)) {
                return <UserFooter>
                    <div className="pull-left"><button type="submit" className="btn btn-primary" onClick={() => {
                        this.props.setVisual(this.editKey(currentNode.id), null);
                    }}>{Titles.Close}</button></div>
                </UserFooter>
            }
            else {
                return <UserFooter>
                    <div className="pull-left">
                        <button type="submit" className="btn btn-primary" onClick={() => {
                            this.props.setVisual(this.editKey(currentNode.id), EDITMODE);
                        }}>{Titles.New}</button></div></UserFooter>
            }
        }
        return null;
    }
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ValidationListItem);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var form = this.form();
        var footer = this.footer();
        var tab_key = currentNode ? this.tabKey(currentNode.id) : null;
        var def = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIExtensionDefinition);
        return (
            <DropDownMenu
                usermode={true}
                icon={'fa fa-cog'}
                width={500}
                open={UIA.Visual(state, EXTENSION_DEFINITION_MENU)}
                onClick={() => {
                    this.props.toggleVisual(EXTENSION_DEFINITION_MENU)
                }}
                header={currentNode ? (<Tabs>
                    <div className="btn-group">
                        <button onClick={() => this.props.setVisual(tab_key, Titles.ExtensionDefinition)}
                            type="button" className="btn btn-default btn-flat">{Titles.ExtensionDefinition}</button>
                        <button onClick={() => this.props.setVisual(tab_key, Titles.ExtensionConfig)}
                            type="button" className="btn btn-default btn-flat">{Titles.ExtensionConfig}</button>
                    </div>
                    <div className="btn-group">
                        {UIA.VisualEq(state, tab_key, Titles.ExtensionDefinition) ? (<button onClick={() => {
                            if (this.state.property) {
                                if (!def) {
                                    def = createExtensionDefinition();
                                }
                                def.definition[this.state.property] = defaultExtensionDefinitionType();
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.UIExtensionDefinition,
                                    id: currentNode.id,
                                    value: def
                                });

                                this.setState({ property: '' });
                            }
                        }}
                            type="button" className="btn btn-default btn-flat">{Titles.Add}</button>) : null}
                    </div>
                </Tabs>) : null}
                footer={footer}>
                <TabContainer>
                    <TabContent>
                        <TabPane active={UIA.VisualEq(state, tab_key, Titles.ExtensionConfig)}>Titles.ExtensionDefinition</TabPane>
                        <TabPane active={UIA.VisualEq(state, tab_key, Titles.ExtensionDefinition)}>
                            <TextInput
                                value={this.state.property}
                                label={Titles.Property}
                                onChange={(val) => {
                                    this.setState({ property: val });
                                }} />
                            {def ? <EnumeratedTable columns={[{ title: Titles.Name, value: 'name' }]}
                                columnButtons={[(x) => {
                                    return <div className="pull-right"><button onClick={() => {
                                        delete def.definition[x.name];
                                        def.definition = { ...def.definition };
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.UIExtensionDefinition,
                                            id: currentNode.id,
                                            value: { ...def }
                                        });

                                    }} className="btn btn-block btn-default">x</button></div>
                                }]}
                                data={Object.keys(def.definition).map(key => {
                                    return {
                                        name: key
                                    }
                                })}
                            /> : null}
                        </TabPane>
                    </TabContent>
                </TabContainer>
            </DropDownMenu>
        );
    }
}

export default UIConnect(ExtensionDefinitionMenu)