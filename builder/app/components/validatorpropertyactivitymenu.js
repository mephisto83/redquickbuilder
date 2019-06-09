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
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType, ValidationUI } from '../constants/nodetypes';
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode, removeValidator, removeValidatorValidation } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ValidatorPropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Validator);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var validator;
        if (active && currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ValidatorModel)) {

            validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator);
        }
        let propertyValidations = <div></div>;
        if (validator && validator.properties) {
            propertyValidations = Object.keys(validator.properties).map(key => {
                let _validates = validator.properties[key];
                let visualKey = `ValidatorPropertyActivityMenu${key}-${currentNode.id}`;
                let selectedValidations = Object.keys(_validates && _validates.validators ? _validates.validators : {}).map(v => {
                    let selK = `${visualKey}-selected-validation`;
                    let selKInner = `${selK}-inne-${v}-r`;
                    return (
                        <TreeViewMenu
                            key={`${v}-v-v`}
                            title={v}
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
                                    let validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator) || createValidator();
                                    validator = removeValidatorValidation(validator, { property: key, validator: v })
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        id,
                                        prop: NodeProperties.Validator,
                                        value: validator
                                    })
                                }} />
                        </TreeViewMenu>
                    )
                })
                let validationUis = Object.keys(ValidationUI).filter(x => !_validates || !_validates.validators || !_validates.validators[x]).reverse().map(valiationUi => {
                    return (
                        <TreeViewMenu
                            hideArrow={true}
                            key={`${valiationUi}-afjlskf-asfd`}
                            title={valiationUi}
                            icon={'fa fa-plus-square-o'}
                            onClick={() => {
                                let id = currentNode.id;
                                var validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator) || createValidator();
                                validator = addValidatator(validator, {
                                    id: key,
                                    validator: valiationUi,
                                    validatorArgs: {
                                        ...ValidationUI[valiationUi]
                                    }
                                });
                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                    id,
                                    prop: NodeProperties.Validator,
                                    value: validator
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
                        <TreeViewMenu hideArrow={true} title={Titles.RemoveValidation} icon={'fa fa-minus'} onClick={() => {
                            let id = currentNode.id;

                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: key,
                                source: id,
                            });
                        }} />
                        <TreeViewMenu title={Titles.SelectedValidations}
                            icon={'fa  fa-list-ul'}
                            open={UIA.Visual(state, `${visualKey}-selected-validations`)}
                            active={UIA.Visual(state, `${visualKey}-selected-validations`)}
                            toggle={() => {
                                this.props.toggleVisual(`${visualKey}-selected-validations`)
                            }} >
                            {selectedValidations}
                        </TreeViewMenu>
                        <TreeViewMenu title={Titles.SelectValidation}
                            icon={'fa fa-plus-circle'}
                            open={UIA.Visual(state, `${visualKey}-selectvalidation`)}
                            active={UIA.Visual(state, `${visualKey}-selectvalidation`)}
                            toggle={() => {
                                this.props.toggleVisual(`${visualKey}-selectvalidation`)
                            }} >
                            {validationUis}
                        </TreeViewMenu>
                    </TreeViewMenu>
                );
            });
            propertyValidations = (
                <div style={{ position: 'relative' }}>
                    <MainSideBar>
                        <SideBar>
                            <SideBarMenu>
                                {propertyValidations}
                            </SideBarMenu>
                        </SideBar>
                    </MainSideBar>
                </div>
            );
        }

        return (
            propertyValidations
        );
    }
}

export default UIConnect(ValidatorPropertyActivityMenu)