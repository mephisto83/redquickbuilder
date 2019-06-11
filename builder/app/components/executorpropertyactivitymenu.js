// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import ExecutorItem from './executoritem';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType, ExecutorUI } from '../constants/nodetypes';
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode, removeValidator, removeValidatorValidation, uuidv4 } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ExecutorPropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Executor);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var executor;
        if (active && currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel)) {

            executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor);
        }
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
                                    let validator = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
 

                                    let _validates = validator.properties[key];
                                    delete _validates.validators[v] 

                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        id,
                                        prop: NodeProperties.Executor,
                                        value: validator
                                    })
                                }} />
                            <ExecutorItem node={currentNode.id} property={key} validator={v} />
                        </TreeViewMenu>
                    )
                })
                let validationUis = Object.keys(ExecutorUI).filter(x => !_validates || !_validates.validators || !_validates.validators[x]).reverse().map(executorUI => {
                    return (
                        <TreeViewMenu
                            hideArrow={true}
                            key={`${executorUI}-afjlskf-asfd`}
                            title={executorUI}
                            icon={'fa fa-plus-square-o'}
                            onClick={() => {
                                let id = currentNode.id;
                                var executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createValidator();
                                executor = addValidatator(executor, {
                                    id: key,
                                    validator: uuidv4(),
                                    validatorArgs: {
                                        type: executorUI,
                                        ...ExecutorUI[executorUI]
                                    }
                                });
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    id,
                                    prop: NodeProperties.Executor,
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
                        <SideBar>
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