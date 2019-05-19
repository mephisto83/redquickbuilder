// @flow
import React, { Component } from 'react';


export default class DropDownMenu extends Component {
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
    render() {
        var ops = {};
        if (this.props.width) {
            ops.style = { width: this.props.width }
        }
        return (
            <li className={`dropdown ${this.menuType()} ${this.open()}`}>
                <a className="dropdown-toggle" data-toggle="dropdown" aria-expanded={this.ariaExpanded()} onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }}>
                    <i className={this.icon()}></i>
                    {this.label()}
                </a>
                <ul className="dropdown-menu" {...ops}>
                    {this.props.headerText ? <li className="header">{this.props.headerText}</li> : null}
                    <li>
                        <ul className="menu">
                            {this.props.children}
                        </ul>
                    </li>
                    {this.props.footerText ? <li className="footer">{this.props.footerText}</li> : null}
                </ul>
            </li>
        );
    }
}
