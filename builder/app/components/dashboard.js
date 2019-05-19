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
import { GooMenuSVG } from './goomenu';
import GooMenu from './goomenu';
const NODE_MENU = 'NODE_MENU';
const CONNECTING_NODE = 'CONNECTING_NODE';
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
        return (
            <div className={`skin-red sidebar-mini skin-red ${this.minified()}`} style={{
                height: 'auto',
                minHeight: '100vh'
            }}>
                <div className="wrapper" style={{ height: '100vh' }} >
                    <GooMenuSVG />
                    <GooMenu
                        visible={UIA.Visual(state, UIA.SELECTED_NODE)}
                        left={menu_left}
                        open={UIA.Visual(state, NODE_MENU)}
                        onToggle={() => {
                            this.props.toggleVisual(NODE_MENU);
                        }}
                        top={menu_top}
                        menuItems={nodeSelectionMenuItems}
                    />
                    <div data-tid="container">
                        <Header>
                            <DashboardLogo />
                            <DashboardNavBar>
                                <SidebarToggle />
                                <NavBarMenu>
                                    <DropDownMenu open={UIA.Visual(state, 'dashboard-menu')} onClick={() => {
                                        this.props.toggleVisual('dashboard-menu')
                                    }}>
                                        <DropDownMenuItem icon={"ion ion-ios-gear-outline"} title={'title'} description="as aksd lasdf"></DropDownMenuItem>
                                    </DropDownMenu>

                                    <NavBarButton onClick={() => {
                                        this.props.toggleVisual('side-panel-open')
                                    }} />
                                </NavBarMenu>
                            </DashboardNavBar>
                        </Header>
                        <MainSideBar>
                            <SideBarMenu>
                                <TreeViewMenu
                                    open={UIA.Visual(state, VC.GraphOperationMenu)}
                                    active={UIA.Visual(state, VC.GraphOperationMenu)}
                                    title={Titles.GraphOperations}
                                    toggle={() => {
                                        this.props.toggleVisual(VC.GraphOperationMenu)
                                    }}>
                                    <TreeViewItem title={Titles.AddNode} onClick={() => {
                                        this.props.graphOperation(UIA.NEW_NODE);
                                    }} />
                                    <TreeViewItem title={'asdf'} />
                                    <TreeViewItem title={'asdf'} />
                                    <TreeViewItem title={'asdf'} />
                                </TreeViewMenu>
                                <TreeViewMenu title={'menu'}>
                                    <TreeViewItem title={'asdf'} />
                                    <TreeViewItem title={'asdf'} />
                                    <TreeViewItem title={'asdf'} />
                                    <TreeViewItem title={'asdf'} />
                                </TreeViewMenu>
                            </SideBarMenu>
                        </MainSideBar>
                        <Content>
                            <MindMap
                                onNodeClick={(nodeId, boundingBox) => {
                                    if (UIA.Visual(state, CONNECTING_NODE)) {
                                        this.props.graphOperation(UIA.NEW_LINK, {
                                            target: nodeId,
                                            source: UIA.Visual(state, UIA.SELECTED_NODE)
                                        });
                                        this.props.setVisual(CONNECTING_NODE, false);
                                        this.props.setVisual(UIA.SELECTED_NODE, null);
                                    }
                                    else {
                                        if ([UIA.Visual(state, UIA.SELECTED_NODE)].indexOf(nodeId) === -1) {
                                            this.props.SelectedNode(nodeId);
                                            this.props.setVisual(UIA.SELECTED_NODE_BB, boundingBox);
                                        }
                                        else {
                                            this.props.SelectedNode(null);
                                        }
                                    }
                                }}
                                selectedColor={UIA.Colors.SelectedNode}
                                selectedNodes={[UIA.Visual(state, UIA.SELECTED_NODE)].filter(x => x)}
                                graph={UIA.Graphs(state, UIA.Application(state, UIA.CURRENT_GRAPH))}></MindMap>
                        </Content>
                        <SideBar open={UIA.Visual(state, 'side-panel-open')}>
                            <SideBarTabs>
                                <SideBarTab />
                            </SideBarTabs>
                            <SideBarContent></SideBarContent>
                        </SideBar>
                    </div>
                </div >
            </div >
        );
    }
}
export default UIConnect(Dashboard)