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
import ButtonList from './buttonlist';
import TextBox from './textinput';
import SideMenuContainer from './sidemenucontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import { GetNode, GetAllChildren } from '../methods/graph_methods';
import { clipboard } from 'electron';
import { GetSpecificModels, GetAllModels, CreateLoginModels, CreateDefaultView, AddAgentUser, CreateAgentFunction } from '../constants/nodepackages';
import TreeViewMenu from './treeviewmenu';
import { PARAMETER_TAB } from './dashboard';
import SideBar from './sidebar';
import SideBarMenu from './sidebarmenu';
import MainSideBar from './mainsidebar';
import { FunctionTypes, MethodFunctions, HTTP_METHODS } from '../constants/functiontypes';
import BatchMenu from './batchmenu';

class QuickMethods extends Component {
    render() {
        var { state } = this.props;
        let sharedcontrolkey = 'View Package Shared Control';
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        function getChosenChildren() {
            let chosenChildren = UIA.GetModelPropertyChildren(currentNode.id).filter(child => {
                return UIA.Visual(state, UIA.ChoseModel(child.id));
            }).map(x => x.id);
            return chosenChildren;
        }
        return (
            <MainSideBar relative={true}>
                <SideBar relative={true} style={{ paddingTop: 0 }}>
                    <SideBarMenu>
                        <TreeViewMenu
                            title={Titles.QuickMethods}
                            open={UIA.Visual(state, Titles.QuickMethods)}
                            active={true}
                            toggle={() => {
                                this.props.toggleVisual(Titles.QuickMethods)
                            }}
                            icon={'fa fa-tag'}>
                            <TreeViewMenu
                                title={Titles.UIParameters}
                                open={UIA.Visual(state, Titles.UIParameters)}
                                active={true}
                                toggle={() => {
                                    this.props.toggleVisual(Titles.UIParameters)
                                }}
                                icon={'fa fa-tag'}>
                                <BatchMenu />
                            </TreeViewMenu>
                            <TreeViewMenu hideArrow={true} title={GetSpecificModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, GetSpecificModels);
                            })} />
                            <TreeViewMenu hideArrow={true} title={GetAllModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, GetAllModels);
                            })} />

                            <TreeViewMenu hideArrow={true} title={CreateLoginModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, CreateLoginModels);
                            })} />
                            <TreeViewMenu hideArrow={true} title={AddAgentUser.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, AddAgentUser);
                            })} />
                            <TreeViewMenu
                                title={CreateDefaultView.type}
                                open={UIA.Visual(state, CreateDefaultView.type)}
                                active={true}
                                toggle={() => {
                                    this.props.toggleVisual(CreateDefaultView.type)
                                }}
                                icon={'fa fa-tag'}>
                                {/* <TextBox label={'View Package'} value={this.props.Visual(state, 'View Package Title')} onChange={(val) => {
                                    this.props.setVisual('View Package Title', val);
                                }} />*/}
                                <TextBox
                                    label={Titles.ViewPackage}
                                    value={UIA.Visual(state, 'View Package Title')}
                                    onChange={(value) => {
                                        this.props.setVisual('View Package Title', value);
                                    }} />
                                <CheckBox
                                    label={Titles.SharedControl}
                                    value={UIA.Visual(state, sharedcontrolkey)}
                                    onChange={(value) => {
                                        this.props.setVisual(sharedcontrolkey, value);
                                    }} />
                                <TreeViewMenu
                                    title={Titles.NodeProperties}
                                    open={UIA.Visual(state, `${Titles.NodeProperties} quick method`)}
                                    active={true}
                                    toggle={() => {
                                        this.props.toggleVisual(`${Titles.NodeProperties} quick method`)
                                    }}
                                    icon={'fa fa-tag'}>
                                    {UIA.GetModelPropertyChildren(currentNode ? currentNode.id : null).map(child => {
                                        //Could use something besides a VISUAL for this.
                                        return (<CheckBox
                                            label={UIA.GetNodeTitle(child)}
                                            key={child.id}
                                            value={UIA.Visual(state, UIA.ChoseModel(child.id))}
                                            onChange={(value) => {
                                                this.props.setVisual(UIA.ChoseModel(child.id), value);
                                            }} />)
                                    })}
                                </TreeViewMenu>
                                <TreeViewMenu hideArrow={true} title={`Create View`} icon={'fa fa-plus'} onClick={(() => {

                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        viewName: UIA.Visual(state, 'View Package Title'),
                                        isSharedComponent: UIA.Visual(state, sharedcontrolkey),
                                        viewType: UIA.ViewTypes.Create,
                                        chosenChildren: getChosenChildren()
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Get View`} icon={'fa fa-plus'} onClick={(() => {

                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        viewName: UIA.Visual(state, 'View Package Title'),
                                        isSharedComponent: UIA.Visual(state, sharedcontrolkey),
                                        viewType: UIA.ViewTypes.Get,
                                        chosenChildren: getChosenChildren()
                                    });
                                })} />
                            </TreeViewMenu>
                            <TreeViewMenu hideArrow={true} title={'Create Model by Agent'} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, {
                                    type: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME),
                                    method: CreateAgentFunction({
                                        nodePackageType: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME),
                                        methodType: MethodFunctions[UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)].method,
                                        model: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_MODEL)),
                                        parentId: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_PARENT)),
                                        agent: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_AGENT)),
                                        httpMethod: HTTP_METHODS.POST,
                                        functionType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE),
                                        functionName: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME)
                                    }),
                                    methodType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)
                                });
                            })} />

                        </TreeViewMenu>
                    </SideBarMenu>
                </SideBar>
            </MainSideBar>
        );
    }
}

export default UIConnect(QuickMethods)