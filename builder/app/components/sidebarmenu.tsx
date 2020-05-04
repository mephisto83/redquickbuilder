// @flow
import React, { Component } from 'react';


export default class SideBarMenu extends Component<any, any> {
    render() {
        return (
            <ul className="sidebar-menu tree">
                {this.props.children}
            </ul>
        );
    }
}
