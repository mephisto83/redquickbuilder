// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { UIConnect } from '../utils/utils';
import DashboardLogo from './dashboardlogo';
import Header from './header';
import DashboardNavBar from './dashboardnavbar';
import SidebarToggle from './sidebartoggle';
import * as UIA from '../actions/uiactions';
import NavBarMenu from './navbarmenu';
import DropDownMenu from './dropdown';
import DropDownMenuItem from './dropdownmenuitem';
import MainSideBar from './mainsidebar';
import SideBarHeader from './sidebarheader';
import * as Titles from './titles';
import SideBarMenu from './sidebarmenu';
import TreeViewMenu from './treeviewmenu';
import TreeViewItem from './treeviewitem';
import Content from './content';
import SideBar from './sidebar';
import SideBarTabs from './sidebartabs';
import SideBarTab from './sidebartab';
import ServiceActivityMenu from './serviceactivitymenu';
import SideBarContent from './sidebarcontent';
import NavBarButton from './navbarbutton';
import CheckBox from './checkbox';
import * as VC from '../constants/visual';
import MindMap from './mindmap';
import ModelActivityMenu from './modelactivitymenu';
import FunctionActivityMenu from './functionactivitymenu';
import PropertyActivityMenu from './propertyactivitymenu';
import AttributeFormControl from './attributeformcontrol';
import PermissionMenu from './permissionmenu';
import ChoiceActivityMenu from './choiceactivitymenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import ModelFilterActivityMenu from './modelfilteractivitymenu';
import ValidationActivityMenu from './validationactivitymenu';
import ValidationItemFormControl from './validationitemactivitymenu';
import ValidatorActivityMenu from './validatoractivitymenu';
import OptionActivityMenu from './optionactivitymenu';
import ExecutorPropertyMenu from './executorpropertymenu';
import ParameterActivityMenu from './parameteractivitymenu';
import OptionItemFormControl from './optionitemformcontrol';
import ExecutorPropertyActivityMenu from './executorpropertyactivitymenu';
import ExecutorActivityMenu from './executoractivitymenu';
import ValidatorPropertyMenu from './validatorpropertymenu';
import ValidatorPropertyActivityMenu from './validatorpropertyactivitymenu';
import ExtensionListActivityMenu from './ExtensionListActivityMenu';
import PermissionActivityMenu from './permissionsactivitymenu';
import ReferenceActivityMenu from './referenceactivitymenu';
import { GooMenuSVG } from './goomenu';
import ChoiceListItemActivityMenu from './choicelistitemactivitymenu';
import GooMenu from './goomenu';
import FormControl from './formcontrol';
import ModelFilterMenu from './modelfiltermenu';
import TextInput from './textinput';
import SelectInput from './selectinput';
import Slider from './slider';
import ExtensionDefinitionMenu from './extensiondefinitionmenu';
import MethodActivityMenu from './methodactivitymenu';
import MethodPropertyMenu from './methodpropertymenu';
import MaestroDetailsMenu from './maestrodetailsmenu';
import NodeManagement from './nodemanagement';
import CommonActivityMenu from './commonactivitymenu';
import ModelRelationshipMenu from './modelrelationshipmenu';
import DepthChoice from './depthchoice';
import MaestroActivityMenu from './maestroactivitymenu';
import SidebarButton from './sidebarbutton';
import ControllerDetailsMenu from './controllerdetailsmenu';
import ControllerActivityMenu from './controlleractivitymenu';
import PermissionDependencyActivityMenu from './permissionsdependentactivitymenu';
import GraphMenu from './graphmenu';
import SectionList from './sectionlist';
import EnumerationActivityMenu from './enumerationactivitymenu'
import SectionEdit from './sectionedit'; import { NotSelectableNodeTypes, NodeProperties, NodeTypes, LinkType, LinkProperties } from '../constants/nodetypes';
import CodeView from './codeview';
import { findLinkInstance, getLinkInstance } from '../methods/graph_methods';
const SIDE_PANEL_OPEN = 'side-panel-open';
const NODE_MENU = 'NODE_MENU';
const CONNECTING_NODE = 'CONNECTING_NODE';
const LINK_DISTANCE = 'LINK_DISTANCE';
const MAIN_CONTENT = 'MAIN_CONTENT';
const MIND_MAP = 'MIND_MAP';
const CODE_VIEW = 'CODE_VIEW';
class Dashboard extends Component {

    minified() {
        var { state } = this.props;
        return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
    }
    nodeSelectionMenuItems() {
        var result = [];
        var { state } = this.props;
        if (UIA.Visual(state, UIA.SELECTED_NODE)) {
            var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
            switch (UIA.GetNodeProp(currentNode, NodeProperties.NODEType)) {
                case NodeTypes.Method:
                case NodeTypes.Action:
                    result.push({
                        onClick: () => {
                            this.props.setVisual(CONNECTING_NODE, LinkProperties.OnScreenLink);
                        },
                        icon: 'fa fa-download',
                        title: Titles.OnLoad
                    }, {
                            onClick: () => {
                                this.props.setVisual(CONNECTING_NODE, LinkProperties.OnSuccessLink);
                            },
                            icon: 'fa  fa-trophy',
                            title: Titles.OnSuccessLink
                        }, {
                            onClick: () => {
                                this.props.setVisual(CONNECTING_NODE, LinkProperties.OnItemSelection);
                            },
                            icon: 'fa  fa-tasks',
                            title: Titles.OnItemSelection
                        }, {
                            onClick: () => {
                                this.props.setVisual(CONNECTING_NODE, LinkProperties.OnAction);
                            },
                            icon: 'fa  fa-tasks',
                            title: Titles.OnAction
                        }, {
                            onClick: () => {
                                this.props.setVisual(CONNECTING_NODE, LinkProperties.OnFailureLink);
                            },
                            icon: 'fa  fa-frown-o',
                            title: Titles.OnFailureLink
                        });
                    break;
                case NodeTypes.ScreenItem:
                case NodeTypes.ScreenCollection:
                case NodeTypes.ScreenContainer:
                case NodeTypes.Screen:
                    result.push({
                        onClick: () => {
                            this.props.setVisual(CONNECTING_NODE, LinkProperties.ChildLink);
                        },
                        icon: 'fa  fa-share-alt',
                        title: Titles.ChildLink
                    });
                    break;
            }
            result.push({
                onClick: () => {
                    this.props.setVisual(CONNECTING_NODE, true);
                },
                icon: 'fa fa-link',
                title: Titles.GenericLink
            })
        }
        return result;
    }
    render() {
        var { state } = this.props;
        var selected_node_bb = UIA.Visual(state, UIA.SELECTED_NODE_BB);
        var menu_left = 0;
        var menu_top = 0;
        if (selected_node_bb) {
            menu_left = selected_node_bb.right;
            menu_top = selected_node_bb.top;
        }
        var nodeSelectionMenuItems = this.nodeSelectionMenuItems();
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let graph = UIA.GetCurrentGraph(state);
        let rootGraph = UIA.GetRootGraph(state);
        let vgraph = UIA.GetVisualGraph(state);
        let main_content = UIA.Visual(state, MAIN_CONTENT);
        let version = '0.0.0';
        let workspace = null;
        if (rootGraph) {
            version = `${rootGraph.version.major}.${rootGraph.version.minor}.${rootGraph.version.build}`;
            workspace = rootGraph.workspace;
        }
        let hoveredLink = null;
        if (UIA.Visual(state, UIA.HOVERED_LINK)) {
            hoveredLink = getLinkInstance(rootGraph, UIA.Visual(state, UIA.HOVERED_LINK));
        }
        return (
            <div className={`skin-red sidebar-mini skin-red ${this.minified()}`} style={{
                height: 'auto',
                minHeight: '100vh'
            }}>
                <div className="wrapper" style={{ height: '100vh' }} >
                    <GooMenuSVG />
                    <GooMenu
                        visible={UIA.Visual(state, UIA.SELECTED_NODE)}
                        left={menu_left - 20}
                        open={UIA.Visual(state, NODE_MENU)}
                        onToggle={() => {
                            this.props.toggleVisual(NODE_MENU);
                        }}
                        top={menu_top + 30}
                        menuItems={nodeSelectionMenuItems}
                    />
                    <div data-tid="container">
                        <Header>
                            <DashboardLogo />
                            <DashboardNavBar>
                                <SidebarToggle />
                                <NavBarMenu>
                                    {UIA.Visual(state, UIA.SELECTED_LINK) ? <NavBarButton icon={'fa fa-minus-square'} onClick={() => {
                                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, UIA.Visual(state, UIA.SELECTED_LINK));
                                        this.props.setVisual(UIA.SELECTED_LINK, null);
                                    }} /> : null}
                                    <GraphMenu />
                                    <NavBarButton icon={'fa fa-plus'} onClick={() => {
                                        this.props.graphOperation(UIA.NEW_NODE);
                                        this.props.setVisual(SIDE_PANEL_OPEN, true);
                                        this.props.setVisual(SELECTED_TAB, DEFAULT_TAB)
                                    }} />

                                    <NavBarButton icon={'fa fa-minus'} onClick={() => {
                                        this.props.graphOperation(UIA.REMOVE_NODE, { id: UIA.Visual(state, UIA.SELECTED_NODE) });
                                        this.props.setVisual(SIDE_PANEL_OPEN, false);
                                        this.props.setVisual(SELECTED_TAB, DEFAULT_TAB)
                                    }} />
                                    <NavBarButton onClick={() => {
                                        this.props.toggleVisual('side-panel-open')
                                    }} />
                                </NavBarMenu>
                            </DashboardNavBar>
                        </Header>
                        <MainSideBar>
                            <SideBarMenu>
                                <SideBarHeader title={Titles.MainNavigation} />
                                <TreeViewMenu active={main_content === MIND_MAP || !main_content} hideArrow={true} title={Titles.MindMap} icon={'fa fa-map'} onClick={() => {
                                    this.props.setVisual(MAIN_CONTENT, MIND_MAP);
                                }} />
                                <TreeViewMenu active={main_content === CODE_VIEW} hideArrow={true} title={Titles.CodeView} icon={'fa fa-code'} onClick={() => {
                                    this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
                                }} />

                                {hoveredLink && hoveredLink.properties ? <SideBarHeader title={hoveredLink.properties.type} /> : null}
                                <SideBarHeader title={Titles.FileMenu} />

                                <TreeViewMenu
                                    open={UIA.Visual(state, VC.ApplicationMenu)}
                                    active={UIA.Visual(state, VC.ApplicationMenu)}
                                    title={Titles.AppMenu}
                                    toggle={() => {
                                        this.props.toggleVisual(VC.ApplicationMenu)
                                    }}>
                                    <TreeViewMenu hideArrow={true} title={Titles.New} icon={'fa fa-plus'} onClick={() => {
                                        this.props.newRedQuickBuilderGraph();
                                    }} />
                                    <TreeViewMenu hideArrow={true} title={Titles.Open} icon={'fa fa-folder-open'} onClick={() => {
                                        this.props.openRedQuickBuilderGraph();
                                    }} />
                                    <TreeViewMenu hideArrow={true} title={Titles.Save} icon={'fa fa-save'} onClick={() => {
                                        this.props.saveGraphToFile();
                                    }} />
                                    <TreeViewMenu hideArrow={true} title={Titles.Scaffold} icon={'fa fa-cog'} onClick={() => {
                                        this.props.scaffoldProject();
                                    }} />
                                    <TreeViewMenu hideArrow={true} title={Titles.PublishFiles} icon={'fa fa-cog'} onClick={() => {
                                        this.props.scaffoldProject({ filesOnly: true });
                                    }} />
                                    <TreeViewMenu hideArrow={true} title={Titles.SetWorkingDirectory} icon={'fa fa-folder-open'} onClick={() => {
                                        this.props.setWorkingDirectory();
                                    }} />
                                    <TreeViewMenu title={version} hideArrow={true} />
                                    {workspace ? <TreeViewMenu hideArrow={true} title={workspace} icon={'fa fa-cog'} /> : null}
                                    <SectionEdit />
                                </TreeViewMenu>

                                <TreeViewMenu
                                    open={UIA.Visual(state, VC.GraphPropertiesMenu)}
                                    active={UIA.Visual(state, VC.GraphPropertiesMenu)}
                                    title={Titles.GraphPropertiesMenu}
                                    toggle={() => {
                                        this.props.toggleVisual(VC.GraphPropertiesMenu)
                                    }}>
                                    <TreeViewItemContainer>
                                        <Slider min={30} max={500}
                                            onChange={(value) => {
                                                this.props.setVisual(LINK_DISTANCE, value);
                                            }}
                                            value={UIA.Visual(state, LINK_DISTANCE)} />
                                    </TreeViewItemContainer>
                                    <TreeViewItemContainer>
                                        <DepthChoice />
                                    </TreeViewItemContainer>
                                </TreeViewMenu>
                                <SectionList />
                                <NodeManagement />
                                <MaestroDetailsMenu />
                                <ControllerDetailsMenu />
                            </SideBarMenu>
                        </MainSideBar>
                        <Content>
                            <CodeView active={UIA.Visual(state, MAIN_CONTENT) === CODE_VIEW} />
                            <MindMap
                                linkDistance={UIA.Visual(state, LINK_DISTANCE)}
                                onNodeClick={(nodeId, boundingBox) => {
                                    if (UIA.Visual(state, CONNECTING_NODE)) {
                                        let selectedId = UIA.Visual(state, UIA.SELECTED_NODE);
                                        console.log(`selectedId:${selectedId} => nodeId:${nodeId}`)
                                        let properties = UIA.Visual(state, CONNECTING_NODE);
                                        if (properties === true) {
                                            this.props.graphOperation(UIA.NEW_LINK, {
                                                target: nodeId,
                                                source: selectedId
                                            });
                                        }
                                        else {
                                            this.props.graphOperation(UIA.NEW_LINK, {
                                                target: nodeId,
                                                source: selectedId,
                                                properties
                                            });
                                        }
                                        this.props.setVisual(CONNECTING_NODE, false);
                                        this.props.setVisual(UIA.SELECTED_NODE, null);
                                    }
                                    else {
                                        if ([UIA.Visual(state, UIA.SELECTED_NODE)].indexOf(nodeId) === -1) {
                                            this.props.SelectedNode(nodeId);
                                            this.props.setVisual(UIA.SELECTED_NODE_BB, boundingBox);
                                            this.props.setVisual(SIDE_PANEL_OPEN, true);
                                        }
                                        else {
                                            this.props.SelectedNode(null);
                                        }
                                    }
                                }}
                                onLinkClick={(linkId, boundingBox) => {
                                    console.log(`link id : ${linkId}`)
                                    this.props.setVisual(UIA.SELECTED_LINK, linkId);

                                    this.props.setVisual(UIA.HOVERED_LINK, linkId);
                                }}

                                selectedColor={UIA.Colors.SelectedNode}
                                selectedLinks={[UIA.Visual(state, UIA.SELECTED_LINK)].filter(x => x)}
                                selectedNodes={[UIA.Visual(state, UIA.SELECTED_NODE)].filter(x => x)}
                                graph={vgraph || graph}></MindMap>
                        </Content>
                        <SideBar open={UIA.Visual(state, SIDE_PANEL_OPEN)} extraWide={UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType)}>
                            <SideBarTabs>
                                <SideBarTab
                                    icon="fa fa-cog"
                                    active={UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB)} onClick={() => {
                                        this.props.setVisual(SELECTED_TAB, DEFAULT_TAB)
                                    }} />
                                <SideBarTab active={UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB)} onClick={() => {
                                    this.props.setVisual(SELECTED_TAB, PARAMETER_TAB)
                                }} />
                                <SideBarTab active={UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB)} onClick={() => {
                                    this.props.setVisual(SELECTED_TAB, SCOPE_TAB)
                                }} />
                            </SideBarTabs>
                            {UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB) ? (<SideBarContent>
                                {currentNode ? (<FormControl>
                                    <TextInput
                                        label={Titles.NodeLabel}
                                        value={currentNode.properties ? currentNode.properties.text : ''}
                                        onChange={(value) => {
                                            this.props.graphOperation(UIA.CHANGE_NODE_TEXT, { id: currentNode.id, value })
                                        }} />
                                    {NotSelectableNodeTypes[currentNode.properties ? UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) : null] ? null : (<SelectInput
                                        disabled={!UIA.CanChangeType(currentNode)}
                                        label={Titles.NodeType}
                                        options={Object.keys(UIA.NodeTypes).filter(x => !NotSelectableNodeTypes[UIA.NodeTypes[x]]).sort((a, b) => a.localeCompare(b)).map(x => {
                                            return {
                                                value: UIA.NodeTypes[x],
                                                title: x
                                            }
                                        })}
                                        onChange={(value) => {
                                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, { prop: UIA.NodeProperties.NODEType, id: currentNode.id, value })
                                        }}
                                        value={currentNode.properties ? UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) : null} />)}
                                    <CheckBox
                                        label={Titles.Collapsed}
                                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Collapsed)}
                                        onChange={(value) => {
                                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                prop: UIA.NodeProperties.Collapsed,
                                                id: currentNode.id,
                                                value
                                            });
                                        }} />
                                    <CheckBox
                                        label={Titles.Pinned}
                                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Pinned)}
                                        onChange={(value) => {
                                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                prop: UIA.NodeProperties.Pinned,
                                                id: currentNode.id,
                                                value
                                            });
                                        }} />
                                </FormControl>) : null}
                                <ChoiceListItemActivityMenu />
                            </SideBarContent>) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (<SideBarContent>
                                <ControllerActivityMenu />
                                <CommonActivityMenu />
                                <FunctionActivityMenu />
                                <MethodActivityMenu />
                                <AttributeFormControl />
                                <ParameterActivityMenu />
                                <ModelActivityMenu />
                                <ValidatorActivityMenu />
                                <ExecutorActivityMenu />
                                <PropertyActivityMenu />
                                <ValidationItemFormControl />
                                <ChoiceActivityMenu />
                                <MaestroActivityMenu />
                                <ValidationActivityMenu />
                                <OptionActivityMenu />
                                <ExtensionListActivityMenu />
                                <OptionItemFormControl />
                                <PermissionActivityMenu />
                                <ExtensionDefinitionMenu />
                                <ModelFilterActivityMenu />
                                <PermissionDependencyActivityMenu />
                                <EnumerationActivityMenu />
                                <ServiceActivityMenu />
                            </SideBarContent>) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (<SideBarContent>
                                <ValidatorPropertyMenu />
                                <ReferenceActivityMenu />
                                <ExecutorPropertyMenu />
                                <ModelRelationshipMenu />
                                <MethodPropertyMenu />
                                <PermissionMenu />
                                <ModelFilterMenu />
                            </SideBarContent>) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (<ValidatorPropertyActivityMenu />) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (<ExecutorPropertyActivityMenu />) : null}
                        </SideBar>
                    </div>
                </div >
            </div >
        );
    }
}
const SELECTED_TAB = 'SELECTED_TAB';
const DEFAULT_TAB = 'DEFAULT_TAB';
const PARAMETER_TAB = 'PARAMETER_TAB';
const SCOPE_TAB = 'SCOPE_TAB';
export default UIConnect(Dashboard)