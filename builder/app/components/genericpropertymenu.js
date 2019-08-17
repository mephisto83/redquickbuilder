// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import ExecutorItem from './executoritem';
import * as Titles from './titles';
import { NodeProperties, ExecutorUI } from '../constants/nodetypes';
import { createValidator, addValidatator, GetNode } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { uuidv4 } from '../utils/array';
import SideBarHeader from './sidebarheader';
class GenericPropertyMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, this.props.nodeType);
        if (!active) {
            return <div></div>;
        }
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var genericProperty = this.props.executor || this.props.validator || this.props.methodParamSetup;
        let _ui = this.props.ui;
        let propertyExecutors = <div></div>;
        if (_ui && genericProperty && genericProperty.properties) {
            propertyExecutors = Object.keys(genericProperty.properties).map(key => {
                let _validates = genericProperty.properties[key];
                let visualKey = `GenericPropertyMenu${key}-${currentNode.id}`;
                let selectedValidations = Object.keys(_validates && _validates.validators ? _validates.validators : {}).map(v => {
                    let selK = `${visualKey}-selected-validation`;
                    let selKInner = `${selK}-inne-${v}-r`;
                    return (
                        <TreeViewMenu
                            key={`${v}-v-v`}
                            title={_validates.validators && _validates.validators[v] && _validates.validators[v].type ? _validates.validators[v].type : v}
                            open={UIA.Visual(state, selKInner)}
                            active={UIA.Visual(state, selKInner)}
                            toggle={() => {
                                this.props.toggleVisual(selKInner)
                            }}
                            icon={'fa fa-tag'}>
                            <TreeViewMenu
                                hideArrow={true}
                                title={Titles.Remove}
                                icon={'fa fa-minus'}
                                onClick={(() => {
                                    let id = currentNode.id;
                                    let validator = genericProperty;


                                    let _validates = validator.properties[key];
                                    delete _validates.validators[v]

                                    if (this.props.onRemove) {
                                        this.props.onRemove();
                                    }
                                })} />
                            <ExecutorItem
                                adjacentNodeId={this.props.adjacentNodeId}
                                onChange={this.props.onChange}
                                function_variables={this.props.function_variables}
                                selectedValidator={genericProperty}
                                node={currentNode.id}
                                property={key}
                                validator={v} />
                        </TreeViewMenu>
                    )
                })
                let validationUis = Object.keys(_ui).filter(x => !_validates || !_validates.validators || !_validates.validators[x]).reverse().map(ui => {
                    return (
                        <TreeViewMenu
                            hideArrow={true}
                            key={`${ui}-afjlskf-asfd`}
                            title={ui}
                            icon={'fa fa-plus-square-o'}
                            onClick={(() => {
                                let id = currentNode.id;
                                var executor = genericProperty;
                                executor = addValidatator(executor, {
                                    id: key,
                                    validator: uuidv4(),
                                    validatorArgs: {
                                        type: ui,
                                        ..._ui[ui]
                                    }
                                });
                                if (this.props.onAdd) {
                                    this.props.onAdd();
                                }
                            })} />
                    );
                })
                return (
                    <TreeViewMenu
                        key={visualKey}
                        open={UIA.Visual(state, visualKey)}
                        active={UIA.Visual(state, visualKey)}
                        title={UIA.GetNodeTitle(GetNode(graph, key))}
                        toggle={() => {
                            this.props.toggleVisual(visualKey)
                        }}>
                        <TreeViewMenu hideArrow={true} title={Titles.RemoveExecution} icon={'fa fa-minus'} onClick={() => {
                            let id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: key,
                                source: id,
                            });
                        }} />
                        <TreeViewMenu title={Titles.SelectedExecutors}
                            icon={'fa  fa-list-ul'}
                            open={UIA.Visual(state, `${visualKey}-selected-executions`)}
                            active={UIA.Visual(state, `${visualKey}-selected-executions`)}
                            toggle={() => {
                                this.props.toggleVisual(`${visualKey}-selected-executions`)
                            }} >
                            {selectedValidations}
                        </TreeViewMenu>
                        <TreeViewMenu title={Titles.SelectExecution}
                            icon={'fa fa-plus-circle'}
                            open={UIA.Visual(state, `${visualKey}-selectexecution`)}
                            active={UIA.Visual(state, `${visualKey}-selectexecution`)}
                            toggle={() => {
                                this.props.toggleVisual(`${visualKey}-selectexecution`)
                            }} >
                            {validationUis}
                        </TreeViewMenu>
                    </TreeViewMenu>
                );
            });
            propertyExecutors = (
                <div style={{ position: 'relative' }}>
                    <MainSideBar relative={true}>
                        <SideBar relative={true}>
                            <SideBarMenu relative={true}>
                                <SideBarHeader title={'Property Setups'} />
                                {propertyExecutors}
                            </SideBarMenu>
                        </SideBar>
                    </MainSideBar>
                </div>
            );
        }

        return (
            propertyExecutors
        );
    }
}

export default UIConnect(GenericPropertyMenu)