// @flow
import React, { Component } from 'react';


export default class SideBar extends Component {
    open() {
        return this.props.open ? 'control-sidebar-open' : '';
    }
    extraWidth() {
        return this.props.extraWide ? 'extra-wide' : '';
    }
    render() {
        return (
            <aside className={`control-sidebar control-sidebar-dark ${this.open()} ${this.extraWidth()}`}>
                {this.props.children}
            </aside>
        );
    }
}
