// @flow
import React, { Component } from 'react';


export default class SideBarMenu extends Component {
    render() {
        return (
            <ul className="sidebar-menu tree">
                <li className="header">MAIN NAVIGATION</li>
                {this.props.children}
            </ul>
        );
    }
}
