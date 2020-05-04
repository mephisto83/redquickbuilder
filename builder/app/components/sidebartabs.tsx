// @flow
import React, { Component } from 'react';


export default class SideBarTabs extends Component<any, any> {
    render() {
        return (
            <ul className="nav nav-tabs nav-justified control-sidebar-tabs">
                {this.props.children}
            </ul>
        );
    }
}
