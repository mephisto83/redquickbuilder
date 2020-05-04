// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import DropDownMenu from './dropdown';
import DropDownMenuItem from './dropdownmenuitem';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';

const GRAPH_MENU = 'GRAPH_MENU';
class GraphMenu extends Component<any, any> {
    render() {
        var me = this;
        var { state } = me.props;
        return (
            <DropDownMenu icon={'fa fa-cart-plus'} open={UIA.Visual(state, GRAPH_MENU)} onClick={() => {
                this.props.toggleVisual(GRAPH_MENU)
            }}>
                <DropDownMenuItem icon={"fa fa-plus"}
                    title={Titles.AddNewSection}
                    onClick={() => {
                        this.props.addNewSubGraph();
                    }}
                    description={Titles.AddNewSectionDescription}></DropDownMenuItem>
            </DropDownMenu>
        );
    }
}
export default UIConnect(GraphMenu);
