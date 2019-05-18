// @flow
import React, { Component } from 'react';


export default class SideBarTab extends Component {
    icon() {
        return this.props.icon || "fa fa-wrench";
    }
    active() {
        return this.props.active || "";
    }
    ariaExapanded() {
        return this.props.active ? 'true' : 'false';
    }
    render() {
        return (
            <li className={this.active()}>
                <a data-toggle="tab" aria-expanded={this.ariaExapanded()}>
                    <i className={this.icon()}></i>
                </a>
            </li>
        );
    }
}
