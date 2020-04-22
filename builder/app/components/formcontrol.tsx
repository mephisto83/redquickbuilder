// @flow
import React, { Component } from 'react';


export default class FormControl extends Component {
    _class() {
        return this.props.sidebarform ? 'sidebar-form' : '';
    }
    render() {
        return (
            <form role="form" className={this._class()} {...{ style: { paddingRight: 10, ...(this.props.style || {}) } }}>
                {this.props.children}
            </form>
        );
    }
}
