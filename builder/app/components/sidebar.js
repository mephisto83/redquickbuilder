// @flow
import React, { Component } from 'react';
import { RelativeMenuCss } from '../constants/visual';


export default class SideBar extends Component {
    open() {
        return this.props.open ? 'control-sidebar-open' : '';
    }
    extraWidth() {
        return this.props.extraWide ? 'extra-wide' : '';
    }
    relative() {
        return this.props.relative ? RelativeMenuCss : {};
    }

    render() {
        return (
            <aside style={{ ...this.relative(), ...(this.props.style || {}) }} className={`control-sidebar control-sidebar-dark ${this.open()} ${this.extraWidth()}`
            }>
                {this.props.children}
            </aside >
        );
    }
}
