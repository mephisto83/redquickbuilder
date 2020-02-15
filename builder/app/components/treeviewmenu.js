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
            <li title={this.props.description} className={`treeview ${this.active()} ${this.open()}`}>
                <a onClick={() => {
                    if (this.props.toggle)
                        this.props.toggle()
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }}>
                    {this.props.hideIcon ? null : <i className={`${this.icon()}`}></i>}
                    <span title={this.props.title}>{this.props.title}</span>
                    {this.props.hideArrow ? null : (<span className="pull-right-container">
                        <i className="fa fa-angle-left pull-right" ></i>
                        {this.props.right ? this.props.right : null}
                    </span>)}
                    {!this.props.hideArrow && this.props.right ? null : (<span className="pull-right-container">
                        {this.props.right ? this.props.right : null}
                    </span>)}
                </a>
                <ul className="treeview-menu" style={{ display: this.display(), ...(this.props.innerStyle || {}) }}>
                    {this.props.children}
                </ul>
            </li>
        );
    }
}
