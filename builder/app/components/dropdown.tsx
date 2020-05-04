// @flow
import React, { Component } from 'react';


export default class DropDownMenu extends Component<any, any> {
    menuType() {
        return 'messages-menu';
    }
    open() {
        return this.props.open ? 'open' : '';
    }
    ariaExpanded() {
        return this.props.open ? 'true' : 'false';
    }
    icon() {
        return this.props.icon || "fa fa-envelope-o"
    }
    label() {
        return null;//<span className="label label-success">4</span>
    }
    usermode() {
        return this.props.usermode;
    }
    usermenu() {
        return this.props.usermode ? 'user user-menu' : '';
    }
    userbody() {
        return this.props.usermode ? 'user user-body' : '';
    }
    userheader() {
        return this.props.usermode ? 'header' : 'header';
    }
    render() {
        var ops = {};
        if (this.props.width) {
            ops.style = { width: this.props.width }
        }
        return (
            <li className={`dropdown ${this.usermenu()} ${this.menuType()} ${this.open()}`}>
                <a className="dropdown-toggle" data-toggle="dropdown" aria-expanded={this.ariaExpanded()} onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }}>
                    <i className={this.icon()}></i>
                    {this.label()}
                </a>
                <ul className="dropdown-menu" {...ops}>
                    {this.props.headerText ? <li className={this.userheader()}>{this.props.headerText}</li> : null}
                    {this.props.header ? <li className={this.userheader()}>{this.props.header}</li> : null}
                    {this.usermode() ? (<li className={this.userbody()}>
                        <div className="row">
                            {this.props.children}
                        </div>
                    </li>) : (<li className={this.userbody()}>
                        <ul className="menu">
                            {this.props.children}
                        </ul>
                    </li>)}
                    {this.props.footer ? this.props.footer : null}
                </ul>
            </li>
        );
    }
}
