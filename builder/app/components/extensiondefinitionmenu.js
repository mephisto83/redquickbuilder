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
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType) || UIA.IsCurrentNodeA(state, UIA.NodeTypes.ChoiceList);
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
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType) || UIA.IsCurrentNodeA(state, UIA.NodeTypes.ChoiceList);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (active && currentNode) {
            var def = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIExtensionDefinition);
            var addBtn = def && def.config.isEnumeration ? (<div className="pull-right">
                <button type="submit" className="btn btn-primary" onClick={() => {
                    def.config.list = [...def.config.list, {}];
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: UIA.NodeProperties.UIExtensionDefinition,
                        id: currentNode.id,
                        value: { ...def }
                    });
                }}>{Titles.Add}</button>
            </div>) : null;
            var tab_key = currentNode ? this.tabKey(currentNode.id) : null;
            var btns = (<div className="pull-left">

                <div className="btn-group">
                    <button onClick={() => this.props.setVisual(tab_key, Titles.ExtensionDefinition)}
                        type="button"
                        title={Titles.ExtensionDefinition}
                        className="btn btn-default btn-flat"><i className="fa fa-pencil-square" /></button>
                    <button onClick={() => this.props.setVisual(tab_key, Titles.ExtensionConfig)}
                        type="button" title={Titles.ExtensionConfig}
                        className="btn btn-default btn-flat"><i className="fa fa-book" /></button>
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
            </div>
            )
            return (<UserFooter>
                {btns}
                {addBtn}
            </UserFooter>)
        }
        return null;
    }
    render() {
        var { state } = this.props;
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
                header={currentNode ? (null) : null}
                footer={footer}>
                <TabContainer>
                    <TabContent>
                        <TabPane active={UIA.VisualEq(state, tab_key, Titles.ExtensionConfig)}>
                            {def ? <CheckBox
                                label={Titles.Enumerable}
                                value={def.config.isEnumeration}
                                onChange={(value) => {
                                    def.config.isEnumeration = value;
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: UIA.NodeProperties.UIExtensionDefinition,
                                        id: currentNode.id,
                                        value: { ...def, config: { ...def.config } }
                                    });
                                }} /> : null}
                            {def ? (
                                <EnumeratedTable columns={Object.keys(def.definition).map(key => {
                                    return { title: key, value: key }
                                })}
                                    dataFunc={(x, key, index) => {
                                        return (<TextInput
                                            label={Titles.Value}
                                            value={x}
                                            onChange={(value) => {
                                                if (def.config.isEnumeration) {
                                                    if (def.config && def.config.list && def.config.list[index]) {
                                                        def.config.list[index][key] = value;
                                                    }
                                                }
                                                else {
                                                    if (def.config && def.config.dictionary) {
                                                        def.config.dictionary[key] = value;
                                                    }
                                                }
                                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                    prop: UIA.NodeProperties.UIExtensionDefinition,
                                                    id: currentNode.id,
                                                    value: { ...def, config: { ...def.config, dictionary: { ...def.config.dictionary }, list: [...def.config.list] } }
                                                });
                                            }}
                                        />)
                                    }}
                                    columnButtons={def.config.isEnumeration ? [(x, xi) => {
                                        return <div className="pull-right"><button onClick={() => {
                                            if (def.config.isEnumeration) {
                                                if (def.config && def.config.list && def.config.list[xi]) {
                                                    def.config.list = [...def.config.list.filter((a, i) => i !== xi)];
                                                }
                                                // delete def.definition[x.name];
                                                // def.definition = { ...def.definition };
                                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                    prop: UIA.NodeProperties.UIExtensionDefinition,
                                                    id: currentNode.id,
                                                    value: { ...def }
                                                });
                                            }

                                        }} className="btn btn-block btn-default"><i className="fa fa-trash" /></button></div>
                                    }] : []}
                                    data={(def.config.isEnumeration ? def.config.list.map(obj => {
                                        return {
                                            ...obj
                                        }
                                    }) : ([{ ...def.config.dictionary }]))}
                                />
                            ) : null}
                        </TabPane>
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