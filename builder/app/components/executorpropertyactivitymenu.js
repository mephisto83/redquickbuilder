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

class ExecutorPropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, this.props.nodeType || UIA.NodeTypes.Executor);
        if (!active) {
            return <div></div>;
        }
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var executor;
        if (active && currentNode && UIA.GetNodeProp(currentNode, this.props.modelKey || UIA.NodeProperties.ExecutorModel)) {

            executor = UIA.GetNodeProp(currentNode, this.props.nodeProp || NodeProperties.Executor);
        }
        let _ui = this.props.ui || ExecutorUI;
        let propertyExecutors = <div></div>;
        if (executor && executor.properties) {
            propertyExecutors = Object.keys(executor.properties).map(key => {
                let _validates = executor.properties[key];
                let visualKey = `ExecutorPropertyActivityMenu${key}-${currentNode.id}`;
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
                                onClick={() => {
                                    let id = currentNode.id;
                                    let validator = UIA.GetNodeProp(currentNode, this.props.nodeProp || NodeProperties.Executor) || createValidator();


                                    let _validates = validator.properties[key];
                                    delete _validates.validators[v]

                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        id,
                                        prop: this.props.nodeProp || NodeProperties.Executor,
                                        value: validator
                                    })
                                }} />
                            <ExecutorItem node={currentNode.id} property={key} validator={v} />
                        </TreeViewMenu>
                    )
                })
                let validationUis = Object.keys(_ui).filter(x => !_validates || !_validates.validators || !_validates.validators[x]).reverse().map(executorUI => {
                    return (
                        <TreeViewMenu
                            hideArrow={true}
                            key={`${executorUI}-afjlskf-asfd`}
                            title={executorUI}
                            icon={'fa fa-plus-square-o'}
                            onClick={() => {
                                let id = currentNode.id;
                                var executor = UIA.GetNodeProp(currentNode, this.props.nodeProp || NodeProperties.Executor) || createValidator();
                                executor = addValidatator(executor, {
                                    id: key,
                                    validator: uuidv4(),
                                    validatorArgs: {
                                        type: executorUI,
                                        ..._ui[executorUI]
                                    }
                                });
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    id,
                                    prop: this.props.nodeProp || NodeProperties.Executor,
                                    value: executor
                                })
                            }} />
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
                    <MainSideBar>
                        <SideBar style={{ maxHeight: 600, overflowY: 'auto' }}>
                            <SideBarMenu>
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

export default UIConnect(ExecutorPropertyActivityMenu)