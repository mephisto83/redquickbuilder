// @flow
import React, { Component } from 'react';


export default class SideBarMenu extends Component<any, any> {
    render() {
        return (
            <ul className="sidebar-menu tree control-sidebar-dark">
                {this.props.children}
            </ul>
        );
    }
}
