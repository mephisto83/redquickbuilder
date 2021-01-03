// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import MainSideBar from "./mainsidebar";
import * as UIA from "../actions/uiActions";
import SideBar from "./sidebar";
import TreeViewMenu from "./treeviewmenu";
import * as Titles from "./titles";
import {
    NodeProperties,
    NodeTypes
} from "../constants/nodetypes";
import SideBarMenu from "./sidebarmenu";
import { Themes } from "../constants/themes";
import TreeViewItemContainer from "./treeviewitemcontainer";
import { cssToJson, JSONNode, Children, CssAttributes } from '../methods/cssToJSON';
import SelectInput from "./selectinput";
import CheckBox from "./checkbox";

class ThemeStyleSection extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }
    render() {
        const { state } = this.props;
        let item: string = this.props.item;
        let children: {
            children: Children,
            attributes: CssAttributes,
            properties?: { [str: string]: any }
        } = this.props.child;
        children.properties = children.properties || {};
        return (
            <TreeViewMenu title={this.props.title} open={this.state.open} active onClick={() => {
                this.setState({ open: !this.state.open })
            }}>
                <TreeViewMenu title={item} open active >
                    <TreeViewItemContainer >
                        <CheckBox
                            label={Titles.Ignore}
                            value={children.properties && children.properties[this.props.title] ? children.properties[this.props.title].ignore : false}
                            onChange={(value: boolean) => {
                                if (children && children.properties) {
                                    children.properties[this.props.title] = children.properties[this.props.title] || {};
                                    children.properties[this.props.title].ignore = value;
                                }
                                this.setState({
                                    turn: UIA.GUID()
                                });
                                if (this.props.onChange) {
                                    this.props.onChange();
                                }
                            }} />
                    </TreeViewItemContainer>
                </TreeViewMenu>
            </TreeViewMenu>
        );
    }
}

export default UIConnect(ThemeStyleSection);
