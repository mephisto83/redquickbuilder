// @flow
import React, { Component } from 'react';


export default class SideBar extends Component {
    open() {
        return this.props.open ? 'control-sidebar-open' : '';
    }
    render() {
        return (
            <aside className={`control-sidebar control-sidebar-dark ${this.open()}`}>
                {this.props.children}
            </aside>
        );
    }
}
