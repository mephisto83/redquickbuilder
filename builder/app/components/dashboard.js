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
import SideBarContent from './sidebarcontent';
import NavBarButton from './navbarbutton';
import * as VC from '../constants/visual';
import MindMap from './mindmap';
import ModelActivityMenu from './modelactivitymenu';
import FunctionActivityMenu from './functionactivitymenu';
import PropertyActivityMenu from './propertyactivitymenu';
import AttributeFormControl from './attributeformcontrol';
import ChoiceActivityMenu from './choiceactivitymenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import ValidationActivityMenu from './validationactivitymenu';
import ValidationItemFormControl from './validationitemactivitymenu';
import OptionActivityMenu from './optionactivitymenu';
import ParameterActivityMenu from './parameteractivitymenu';
import OptionItemFormControl from './optionitemformcontrol';
import ExtensionListActivityMenu from './ExtensionListActivityMenu';
import PermissionActivityMenu from './permissionsactivitymenu';
import ReferenceActivityMenu from './referenceactivitymenu';
import { GooMenuSVG } from './goomenu';
import ChoiceListItemActivityMenu from './choicelistitemactivitymenu';
import GooMenu from './goomenu';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import Slider from './slider';
import ExtensionDefinitionMenu from './extensiondefinitionmenu';
import MaestroDetailsMenu from './maestrodetailsmenu';
import CommonActivityMenu from './commonactivitymenu';
import MaestroActivityMenu from './maestroactivitymenu';
import SidebarButton from './sidebarbutton';
import ControllerDetailsMenu from './controllerdetailsmenu';
import ControllerActivityMenu from './controlleractivitymenu';
import GraphMenu from './graphmenu';
import SectionList from './sectionlist';
import SectionEdit from './sectionedit'; import { NotSelectableNodeTypes } from '../constants/nodetypes';
import CodeView from './codeview';
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
            result.push({
                onClick: () => {
                    this.props.setVisual(CONNECTING_NODE, true);
                },
                icon: 'fa fa-link'
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
        let main_content = UIA.Visual(state, MAIN_CONTENT);
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
                                <SideBarHeader title={Titles.FileMenu} />
                                <TreeViewMenu hideArrow={true} title={Titles.New} icon={'fa fa-plus'} onClick={() => {
                                    this.props.newRedQuickBuilderGraph();
                                }} />
                                <TreeViewMenu hideArrow={true} title={Titles.Open} icon={'fa fa-folder-open'} onClick={() => {
                                    this.props.openRedQuickBuilderGraph();
                                }} />
                                <TreeViewMenu hideArrow={true} title={Titles.Save} icon={'fa fa-save'} onClick={() => {
                                    this.props.saveGraphToFile();
                                }} />
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
                                </TreeViewMenu>
                                <SectionEdit />
                                <SectionList />
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
                                        this.props.graphOperation(UIA.NEW_LINK, {
                                            target: nodeId,
                                            source: selectedId
                                        });
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
                                selectedColor={UIA.Colors.SelectedNode}
                                selectedNodes={[UIA.Visual(state, UIA.SELECTED_NODE)].filter(x => x)}
                                graph={graph}></MindMap>
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
                                    <SelectInput
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
                                        value={currentNode.properties ? UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) : null} />
                                </FormControl>) : null}
                                <ChoiceListItemActivityMenu />
                            </SideBarContent>) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (<SideBarContent>
                                <ControllerActivityMenu />
                                <CommonActivityMenu />
                                <FunctionActivityMenu />
                                <AttributeFormControl />
                                <ParameterActivityMenu />
                                <ModelActivityMenu />
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
                            </SideBarContent>) : null}
                            {UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (<SideBarContent>
                                <ReferenceActivityMenu />
                            </SideBarContent>) : null}
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