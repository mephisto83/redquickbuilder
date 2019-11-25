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
import { NodeTypes, NodeProperties, UITypes } from '../constants/nodetypes';
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
        let use_as_default = 'Use As Default Shared Component';
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        function getChosenChildren() {
            let chosenChildren = UIA.GetModelPropertyChildren(currentNode.id).filter(child => {
                return UIA.Visual(state, UIA.ChoseModel(child.id));
            }).map(x => x.id);
            return chosenChildren;
        }
        let defaultParameters = function (title) {
            return {
                viewName: UIA.Visual(state, 'View Package Title'),
                isSharedComponent: UIA.Visual(state, sharedcontrolkey),
                isDefaultComponent: UIA.Visual(state, use_as_default),
                uiTypes: {
                    [UITypes.ReactNative]: UIA.Visual(state, UITypes.ReactNative),
                    [UITypes.ElectronIO]: UIA.Visual(state, UITypes.ElectronIO),
                    [UITypes.VR]: UIA.Visual(state, UITypes.VR),
                    [UITypes.Web]: UIA.Visual(state, UITypes.Web)
                },
                chosenChildren: getChosenChildren()
            }
        };
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
                            <TreeViewMenu
                                title={'More Commands'}
                                open={UIA.Visual(state, 'More Commands')}
                                active={true}
                                toggle={() => {
                                    this.props.toggleVisual('More Commands')
                                }}
                                icon={'fa fa-tag'}>
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
                            </TreeViewMenu>
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
                                <CheckBox
                                    label={UITypes.ElectronIO}
                                    value={UIA.Visual(state, UITypes.ElectronIO)}
                                    onChange={(value) => {
                                        this.props.setVisual(UITypes.ElectronIO, value);
                                    }} />
                                <CheckBox
                                    label={UITypes.ReactNative}
                                    value={UIA.Visual(state, UITypes.ReactNative)}
                                    onChange={(value) => {
                                        this.props.setVisual(UITypes.ReactNative, value);
                                    }} />
                                {UIA.Visual(state, sharedcontrolkey) ? <CheckBox
                                    label={Titles.UseAsDefault}
                                    value={UIA.Visual(state, use_as_default)}
                                    onChange={(value) => {
                                        this.props.setVisual(use_as_default, value);
                                    }} /> : null}
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
                                        ...(defaultParameters()),
                                        viewType: UIA.ViewTypes.Create
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Update View`} icon={'fa fa-plus'} onClick={(() => {

                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        ...(defaultParameters()),
                                        viewType: UIA.ViewTypes.Update
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Get View`} icon={'fa fa-plus'} onClick={(() => {

                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        ...(defaultParameters()),
                                        viewType: UIA.ViewTypes.Get
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Delete View`} icon={'fa fa-plus'} onClick={(() => {
                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        ...(defaultParameters()),
                                        viewType: UIA.ViewTypes.Delete
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Get All View`} icon={'fa fa-plus'} onClick={(() => {

                                    this.props.executeGraphOperation(currentNode, CreateDefaultView, {
                                        ...(defaultParameters()),
                                        viewType: UIA.ViewTypes.GetAll,
                                        isList: true
                                    });
                                })} />
                                <TreeViewMenu hideArrow={true} title={`Deluxe`} icon={'fa fa-plus'} onClick={(() => {
                                    var operations = [];
                                    [UIA.ViewTypes.Create, UIA.ViewTypes.Update, UIA.ViewTypes.Delete, UIA.ViewTypes.Get].map(t => {
                                        operations.push({
                                            node: currentNode,
                                            method: CreateDefaultView,
                                            options: {
                                                ...(defaultParameters()),
                                                viewName: `${UIA.Visual(state, 'View Package Title')} ${t}`,
                                                viewType: t
                                            }
                                        });
                                    });
                                    operations.push({
                                        node: currentNode,
                                        method: CreateDefaultView,
                                        options: {
                                            ...(defaultParameters()),
                                            viewName: `${UIA.Visual(state, 'View Package Title')} ${UIA.ViewTypes.GetAll}`,
                                            viewType: UIA.ViewTypes.GetAll,
                                            isList: true
                                        }
                                    })

                                    this.props.executeGraphOperations(operations);
                                })
                                } />

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