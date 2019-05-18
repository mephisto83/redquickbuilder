// @flow
import React, { Component } from 'react';

export default class TreeViewMenu extends Component {
    active() {
        return this.props.active ? 'active' : '';
    }
    open() {
        return this.props.open ? 'menu-open' : '';
    }
    display() {
        return this.props.open ? 'block' : 'block';
    }
    icon() {
        return this.props.icon || "fa fa-dashboard";
    }
    render() {
        return (
            <li className={`treeview ${this.active()} ${this.open()}`}>
                <a onClick={() => {
                    if (this.props.toggle)
                        this.props.toggle()
                }}>
                    <i className={`${this.icon()}`}></i> <span>{this.props.title}</span>
                    <span className="pull-right-container">
                        <i className="fa fa-angle-left pull-right"></i>
                    </span>
                </a>
                <ul class="treeview-menu" style={{ display: this.display() }}>
                    {this.props.children}
                </ul>
            </li>
        );
    }
}
