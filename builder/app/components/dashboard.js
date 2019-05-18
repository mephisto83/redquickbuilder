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
import SideBarMenu from './sidebarmenu';
import TreeViewMenu from './treeviewmenu';
import TreeViewItem from './treeviewitem';
import Content from './content';
import SideBar from './sidebar';
import SideBarTabs from './sidebartabs';
import SideBarTab from './sidebartab';
import SideBarContent from './sidebarcontent';
import NavBarButton from './navbarbutton';
import MindMap from './mindmap';
class Dashboard extends Component {

    minified() {
        var { state } = this.props;
        return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
    }
    render() {
        var { state } = this.props;
        return (
            <div className={`skin-red sidebar-mini skin-red ${this.minified()}`} style={{
                height: 'auto',
                minHeight: '100vh'
            }}>
                <div className="wrapper" style={{ height: '100vh' }} >
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
                                <TreeViewMenu open={UIA.Visual(state, 'treeview-menu')} active={UIA.Visual(state, 'treeview-menu')} title={'menu'} toggle={() => {
                                    this.props.toggleVisual('treeview-menu')
                                }}>
                                    <TreeViewItem title={'asdf'} />
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
                            <MindMap></MindMap>
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