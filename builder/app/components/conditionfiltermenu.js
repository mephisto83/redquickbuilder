// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBarHeader from './sidebarheader';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes, FilterUI } from '../constants/nodetypes';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import Box from './box';
import { TARGET, GetLinkChain, SOURCE, GetNode, createExecutor, addMethodValidationForParamter, getMethodValidationForParameter, createValidator, removeMethodValidationParameter } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import GenericPropertyMenu from './genericpropertymenu';
import GenericPropertyContainer from './genericpropertycontainer';
import TextInput from './textinput';
import ButtonList from './buttonlist';
import SideBarMenu from './sidebarmenu';
import TreeViewMenu from './treeviewmenu';
import { PERMISSION, FILTER, VALIDATION } from '../constants/condition';
const CONDITION_FILTER_MENU_PARAMETER = 'condition-filter-menu-parameter';
const CONDITION_FILTER_MENU_PARAMETER_PROPERTIES = 'condition-filter-menu-parameter-properties';
const DATA_SOURCE = 'DATA_SOURCE';
class ConditionFilterMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let methodProps;
        let methodDefinition;
        let methodDefinitionKey = this.props.methodDefinitionKey;
        let interestingNode;
        if (currentNode) {
            switch (methodDefinitionKey) {
                case PERMISSION:
                    interestingNode = UIA.GetPermissionNode(currentNode.id);
                    break;
                case FILTER:
                    interestingNode = UIA.GetModelItemFilter(currentNode.id);
                    break;
                case VALIDATION:
                    interestingNode = UIA.GetValidationNode(currentNode.id);
                    break;

            }
            if (interestingNode) {
                methodDefinition = interestingNode ? UIA.GetMethodDefinition(interestingNode.id) : null;
                methodProps = UIA.GetMethodsProperties(interestingNode.id);
            }
        }
        if (methodDefinition && methodDefinition[methodDefinitionKey] && methodDefinition[methodDefinitionKey].params && methodDefinition[methodDefinitionKey].params.length) {

        }
        else if (this.props.view && currentNode) {
            interestingNode = UIA.GetDataSourceNode(currentNode.id);
            if (!interestingNode) {
                return <div></div>
            }
            methodProps = {
                [DATA_SOURCE]: UIA.GetNodeProp(interestingNode, NodeProperties.UIModelType)
            }
        }
        else {
            return <div></div>
        }
        let filterParameters = UIA.GetMethodPermissionParameters(interestingNode.id, true);

        let id = currentNode.id;
        let models = [];
        if (methodDefinition) {
            models = methodDefinition[methodDefinitionKey].params.map(t => {
                if (typeof (t) === 'object') {
                    return t.key;
                }
                return t;
            }).map(t => {
                return {
                    title: `${UIA.GetNodeTitle(methodProps[t])} (${t})`,
                    value: t,
                    id: t
                }
            });
        }
        else if (this.props.view) {
            models = UIA.GetModelNodes().toNodeSelect();
        }
        let methodFunctionType = this.props.view ? DATA_SOURCE : UIA.GetMethodFunctionType(interestingNode.id);
        let methodFunctionValidation = UIA.GetNodeProp(currentNode, NodeProperties.Condition);// UIA.GetMethodFunctionValidation(permissionNode.id);
        let param_list_key = `${currentNode.id} ${methodFunctionType}`;
        let param = UIA.Visual(state, param_list_key);
        let param_property_list_key = UIA.Visual(state, param_list_key) ? `${param_list_key} ${param}` : null;
        let selectedParameter = UIA.Visual(state, param_list_key);
        let model_properties = UIA.GetModelPropertyChildren(this.props.view ? param : methodProps[param]).toNodeSelect();
        let top = this.getTop({
            model_properties,
            methodProps,
            selectedParameter,
            filterMenuParameter: `${currentNode.id}${CONDITION_FILTER_MENU_PARAMETER}`,
            filterMenuParameterProperties: `${currentNode.id} ${CONDITION_FILTER_MENU_PARAMETER_PROPERTIES}`,
            param_list_key,
            methodFunctionValidation,
            models,
            methodFunctionType,
            param_property_list_key
        });

        let methodParamSetup = getMethodValidationForParameter(
            methodFunctionValidation,
            methodFunctionType,
            UIA.Visual(state, param_list_key),
            UIA.Visual(state, param_property_list_key));

        let updateValidation = () => {
            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                prop: UIA.NodeProperties.Condition,
                id: currentNode.id,
                value: methodFunctionValidation
            });
        };
        let onRemoveValidation = (remove) => {
            if (remove) {
                methodFunctionValidation = removeMethodValidationParameter(
                    methodFunctionValidation,
                    methodFunctionType,
                    UIA.Visual(state, param_list_key), remove);
            }
            updateValidation();
        }
        return (<GenericPropertyContainer title='asdf' subTitle='afaf' nodeType={NodeTypes.Condition} top={top} >
            <GenericPropertyMenu
                ui={FilterUI}
                function_variables={filterParameters}
                methodParamSetup={methodParamSetup}
                nodeType={NodeTypes.Condition}
                onRemove={onRemoveValidation}
                adjacentNodeId={interestingNode.id}
                onChange={updateValidation}
                onAdd={updateValidation}
            />
        </GenericPropertyContainer>)
    }
    getTop(args = {}) {
        let {
            methodProps,
            model_properties,
            models,
            selectedParameter,
            filterMenuParameter = CONDITION_FILTER_MENU_PARAMETER,
            filterMenuParameterProperties = CONDITION_FILTER_MENU_PARAMETER_PROPERTIES,
            param_list_key,
            methodFunctionValidation,
            methodFunctionType,
            param_property_list_key
        } = args;

        let { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        return (
            (<SideBarMenu relative={true}>
                <TreeViewMenu
                    open={UIA.Visual(state, filterMenuParameter)}
                    active={UIA.Visual(state, filterMenuParameter)}
                    title={`${UIA.GetNodeTitle(methodProps[selectedParameter])} (${selectedParameter})` || 'Parameters'}
                    toggle={() => {
                        this.props.toggleVisual(filterMenuParameter)
                    }}>
                    <SideBarHeader title={'Parameters'} />
                    <ButtonList
                        active={true}
                        isSelected={(item) => {
                            return item && selectedParameter === item.id;
                        }}
                        items={models}
                        onClick={(item) => {
                            let methodValidationForParameter = addMethodValidationForParamter(methodFunctionValidation, methodFunctionType, item.id);
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Condition,
                                id: currentNode.id,
                                value: methodValidationForParameter
                            });
                            this.props.setVisual(param_list_key, item.id);
                        }}></ButtonList>
                </TreeViewMenu>
                <TreeViewMenu
                    open={UIA.Visual(state, filterMenuParameterProperties)}
                    active={UIA.Visual(state, filterMenuParameterProperties)}
                    title={UIA.GetNodeTitle(UIA.Visual(state, param_property_list_key)) || 'Parameter Properties'}
                    toggle={() => {
                        this.props.toggleVisual(filterMenuParameterProperties)
                    }}>
                    <SideBarHeader title={'Parameter Properties'} />
                    {param_property_list_key ? (<ButtonList
                        active={true}
                        isSelected={(item) => {
                            return item && UIA.Visual(state, param_property_list_key) === item.id;
                        }}
                        items={model_properties}
                        onClick={(item) => {
                            let methodValidationForParameter = addMethodValidationForParamter(
                                methodFunctionValidation,
                                methodFunctionType,
                                UIA.Visual(state, param_list_key),
                                item.id);
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Condition,
                                id: currentNode.id,
                                value: methodValidationForParameter
                            });
                            this.props.setVisual(param_property_list_key, item.id)
                        }}></ButtonList>) : null}
                </TreeViewMenu>
            </SideBarMenu>
            )
        )
    }
}

export default UIConnect(ConditionFilterMenu)