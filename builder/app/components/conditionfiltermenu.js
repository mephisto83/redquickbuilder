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
const CONDITION_FILTER_MENU_PARAMETER = 'condition-filter-menu-parameter';
const CONDITION_FILTER_MENU_PARAMETER_PROPERTIES = 'condition-filter-menu-parameter-properties';
class ConditionFilterMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Condition);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var permissionNode = UIA.GetPermissionNode(currentNode.id);
        var methodDefinition = permissionNode ? UIA.GetMethodDefinition(permissionNode.id) : null;
        let methodProps = UIA.GetMethodsProperties(permissionNode.id);
        if (methodDefinition && methodDefinition.permission && methodDefinition.permission.params && methodDefinition.permission.params.length) {

        }
        else {
            active = false;
            return <div></div>
        }
        let filterParameters = UIA.GetMethodPermissionParameters(permissionNode.id);

        let id = currentNode.id;
        // let condition = UIA.GetNodeProp(currentNode, NodeProperties.Condition);
        // if (!condition)
        //     return (
        //         <TabPane active={active}>
        //             <ControlSideBarMenu>
        //                 {!condition ? (<ControlSideBarMenuItem onClick={() => {
        //                     condition = UIA.GetNodeProp(currentNode, NodeProperties.Condition) || createExecutor();
        //                     this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
        //                         id,
        //                         prop: NodeProperties.Condition,
        //                         value: condition
        //                     })
        //                 }} icon={'fa fa-puzzle-piece'} title={Titles.AddCondition} description={Titles.AddCondition} />) : null}
        //             </ControlSideBarMenu>
        //         </TabPane>
        //     );
        let models = methodDefinition.permission.params.map(t => {
            return {
                title: `${UIA.GetNodeTitle(methodProps[t])} (${t})`,
                value: t,
                id: t
            }
        });
        let methodFunctionType = UIA.GetMethodFunctionType(permissionNode.id);
        let methodFunctionValidation = UIA.GetNodeProp(currentNode, NodeProperties.Condition);// UIA.GetMethodFunctionValidation(permissionNode.id);
        let param_list_key = `${currentNode.id} ${methodFunctionType}`;
        let param = UIA.Visual(state, param_list_key);
        let param_property_list_key = UIA.Visual(state, param_list_key) ? `${param_list_key} ${param}` : null;
        let selectedParameter = UIA.Visual(state, param_list_key);
        let model_properties = UIA.GetModelPropertyChildren(methodProps[param]).toNodeSelect();
        let top = (<SideBarMenu relative={true}>
            <TreeViewMenu
                open={UIA.Visual(state, CONDITION_FILTER_MENU_PARAMETER)}
                active={UIA.Visual(state, CONDITION_FILTER_MENU_PARAMETER)}
                title={`${UIA.GetNodeTitle(methodProps[selectedParameter])} (${selectedParameter})` || 'Parameters'}
                toggle={() => {
                    this.props.toggleVisual(CONDITION_FILTER_MENU_PARAMETER)
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
                open={UIA.Visual(state, CONDITION_FILTER_MENU_PARAMETER_PROPERTIES)}
                active={UIA.Visual(state, CONDITION_FILTER_MENU_PARAMETER_PROPERTIES)}
                title={UIA.GetNodeTitle(UIA.Visual(state, param_property_list_key)) || 'Parameter Properties'}
                toggle={() => {
                    this.props.toggleVisual(CONDITION_FILTER_MENU_PARAMETER_PROPERTIES)
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
                methodFunctionValidation = removeMethodValidationParameter(methodFunctionValidation, methodFunctionType, UIA.Visual(state, param_list_key));
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
                adjacentNodeId={permissionNode.id}
                onChange={updateValidation}
                onAdd={updateValidation}
            />
        </GenericPropertyContainer>)
    }
}

export default UIConnect(ConditionFilterMenu)