// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import TreeViewMenu from './treeviewmenu';
import TextInput from './textinput';
import TreeViewItem from './treeviewitem';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import MainSideBar from './mainsidebar';
import { NodeProperties } from '../constants/nodetypes';
import SideBarMenu from './sidebarmenu';
import SideBar from './sidebar';
import { GetParameterName, createScreenParameter } from '../methods/graph_methods';
import TabPane from './tabpane';

const NODE_MANAGEMENT_MENU = 'NODE_MANAGEMENT_MENU';
const NODE_MANAGEMENT = 'NODE_MANAGEMENT';
class UIParameters extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            filter: ''
        };
    }
    render() {
        let me = this;
        let { state } = me.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Screen);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        var graph = UIA.GetCurrentGraph(state);
        let filter = (this.state.filter || '').toLowerCase();
        let groups = UIA.GetNodes(state).filter(x => {
            if (!filter) {
                return false;
            }
            var str = this.toFilterString(x);
            return str.indexOf(filter) !== -1;
        }).groupBy(x => UIA.GetNodeProp(x, NodeProperties.NODEType));
        let screenParameters = UIA.GetNodeProp(currentNode, NodeProperties.ScreenParameters) || [];
        let body = screenParameters.map((t, index) => {
            return (
                <TreeViewMenu title={GetParameterName(t)} hideArrow={true} icon={'fa fa-terminal'} key={'param' + index} onClick={() => {
                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                        prop: NodeProperties.ScreenParameters,
                        id: currentNode.id,
                        value: screenParameters.filter(x => x !== t)
                    });
                }} />)
        }) || [];
        const UI_PARAMETERS = 'UI_PARAMETERS';
        const SCREEN_PARAMETERS = 'SCREEN_PARAMETERS';
        return (
            <div style={{ position: 'relative' }}>
                <MainSideBar active={active} relative={true}>
                    <SideBar relative={true} style={{ paddingTop: 0 }}>
                        <SideBarMenu>
                            <TreeViewMenu
                                title={`${Titles.UIParameters}`}
                                icon={'fa fa-object-group'}
                                open={UIA.Visual(state, UI_PARAMETERS)}
                                active={UIA.Visual(state, UI_PARAMETERS)}
                                onClick={() => {
                                    this.props.toggleVisual(UI_PARAMETERS)
                                }}>
                                <FormControl sidebarform={true}>
                                    <TextInput value={UIA.Application(state, 'ui-parameter')}
                                        onClick={() => {
                                            let uiParameter = UIA.Application(state, 'ui-parameter');
                                            if (uiParameter) {
                                                let parameter = createScreenParameter(uiParameter);
                                                screenParameters.push(parameter);
                                                this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                                    prop: NodeProperties.ScreenParameters,
                                                    id: currentNode.id,
                                                    value: screenParameters.unique(x => x.name)
                                                });
                                            }
                                        }}
                                        onChange={(value) => {
                                            this.props.setApplication('ui-parameter', value);
                                        }} inputgroup={true} placeholder={Titles.Filter} />
                                </FormControl>
                                <TreeViewMenu
                                    icon="fa fa-dot-circle-o"
                                    title={Titles.Menu}
                                    open={UIA.Visual(state, SCREEN_PARAMETERS)}
                                    active={UIA.Visual(state, SCREEN_PARAMETERS)}
                                    onClick={() => {
                                        this.props.toggleVisual(SCREEN_PARAMETERS)
                                    }}>
                                    {body}
                                </TreeViewMenu>
                            </TreeViewMenu >
                        </SideBarMenu>
                    </SideBar>
                </MainSideBar>
            </div>
        );
    }
}
export default UIConnect(UIParameters);
