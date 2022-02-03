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
import TextBox from './textinput';
import TextInput from './textinput';
import EnumerationEditMenu from './enumerationeditmenu';
import { NodeProperties, NodeTypes } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';

class EnumerationActivityMenu extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            label: null,
            value: null
        }
    }
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Enumeration);

        if (!active) {
            return <div />;
        }

        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || [];

        return (
            <TabPane active={active} >
                <EnumerationEditMenu title={Titles.Label}
                    value={this.state.label} onChange={(val: string) => {
                        this.setState({
                            label: val
                        })
                    }
                    } />
                <EnumerationEditMenu title={Titles.Value}
                    value={this.state.value} onChange={(val: string) => {
                        this.setState({
                            value: val
                        })
                    }
                    } />
                <div className="btn-group" role="group" aria-label="Basic example">
                    {!this.state.selected ? null : <button type="button" className="btn btn-secondary"
                        onClick={() => {
                            var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || []; this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Enumeration,
                                id: currentNode.id,
                                value: [...enums].filter(x => x.id !== this.state.selected)
                            });
                        }}><i className='fa fa-times' /></button>}
                    <button type="button" className="btn btn-secondary" onClick={() => {
                        var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || [];
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.Enumeration,
                            id: currentNode.id,
                            value: [...enums, {
                                value: this.state.value,
                                label: this.state.label,
                                id: uuidv4()
                            }].unique(x => (x.value + x.label))
                        });
                        this.setState({
                            selected: null,
                            label: null,
                            value: null
                        })
                    }}><i className='fa fa-plus' /></button>
                    {!this.state.selected ? null :
                        <button type="button" onClick={() => {
                            var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || [];
                            let found = enums.find(v => v.id === this.state.selected);
                            if (found) {
                                found.value = this.state.value;
                                found.label = this.state.label;
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    prop: UIA.NodeProperties.Enumeration,
                                    id: currentNode.id,
                                    value: [...enums].unique(x => (x.value + x.label))
                                });
                            }
                        }}
                            className="btn btn-secondary">
                            <i className="fa fa-save" />
                        </button>
                    }
                </div>
                {active && enums && enums.length ? enums.map((_enum) => {
                    return <div className="external-event bg-red" style={{ cursor: 'pointer' }} key={_enum.id} onClick={() => {
                        this.setState({
                            selected: _enum.id,
                            label: _enum.label || '',
                            value: _enum.value || ''
                        })
                    }} > {_enum && _enum.id ? _enum.value : _enum}</div>;
                }) : null}
                <EnumerationEditMenu title={Titles.Batch}
                    value={this.state.value} onChange={(val: string) => {
                        this.setState({
                            batch: val
                        })
                    }
                    } />
                <button type="button" onClick={() => {
                    let { batch } = this.state;
                    try {
                        if (batch) {
                            let batch_res = JSON.parse(batch);
                            let linkTypes = Object.keys(batch_res);
                            let foundNodes = UIA.GetNodesByProperties({
                                [NodeProperties.UIText]: 'LinkType'
                            }, UIA.GetCurrentGraph());
                            if (!foundNodes.length)
                                UIA.graphOperation(
                                    UIA.CreateNewNode(
                                        {
                                            [NodeProperties.UIText]: 'LinkType',
                                            [NodeProperties.NODEType]: NodeTypes.Enumeration,
                                            [NodeProperties.Enumeration]: linkTypes.map((v) => ({
                                                value: v,
                                                label: v,
                                                id: UIA.GUID()
                                            }))
                                        },
                                        (node: Node) => { }
                                    )
                                )(UIA.GetDispatchFunc(), UIA.GetStateFunc());
                            linkTypes.forEach((linkType: string) => {
                                foundNodes = UIA.GetNodesByProperties({
                                    [NodeProperties.UIText]: linkType
                                }, UIA.GetCurrentGraph());
                                if (!foundNodes.length && batch_res[linkType] && batch_res[linkType]['KIKSWITCH']) {
                                    UIA.graphOperation(
                                        UIA.CreateNewNode(
                                            {
                                                [NodeProperties.UIText]: linkType,
                                                [NodeProperties.NODEType]: NodeTypes.Enumeration,
                                                [NodeProperties.Enumeration]: batch_res[linkType]['KIKSWITCH'].map((v: any) => ({
                                                    value: v.value,
                                                    label: v.label,
                                                    id: UIA.GUID()
                                                }))
                                            },
                                            (node: Node) => { }
                                        )
                                    )(UIA.GetDispatchFunc(), UIA.GetStateFunc());
                                }
                            })
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }}
                    className="btn btn-secondary">
                    <i className="fa fa-save" />
                </button>
            </TabPane >
        );
    }
}

export default UIConnect(EnumerationActivityMenu);
