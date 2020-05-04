// @flow
import React, { Component } from 'react';


export default class SideBarTab extends Component<any, any> {
    icon() {
        return this.props.icon || "fa fa-wrench";
    }
    active() {
        return this.props.active ? 'active' : "";
    }
    ariaExapanded() {
        return this.props.active ? 'true' : 'false';
    }
    render() {
        return (
            <li className={this.active()}>
                <a data-toggle="tab" onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }} aria-expanded={this.ariaExapanded()}>
                    <i className={this.icon()}></i>
                </a>
            </li>
        );
    }
}
