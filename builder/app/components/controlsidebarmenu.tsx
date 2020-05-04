// @flow
import React, { Component } from 'react';


export default class ControlSideBarMenu extends Component<any, any> {
    render() {
        return (
            <ul className="control-sidebar-menu">
                {this.props.children}
            </ul>
        );
    }
}


export class ControlSideBarMenuItem extends Component<any, any> {
    icon() {
        return this.props.icon || 'fa fa-birthday-cake';
    }
    render() {
        return (
            <li>
                <a onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }}>
                    <i className={`menu-icon ${this.icon()} bg-red`}></i>

                    <div className="menu-info">
                        <h4 className="control-sidebar-subheading">{this.props.title || ''}</h4>

                        <p>{this.props.description || ''}</p>
                    </div>
                </a>
            </li>
        );
    }
}

export class ControlSideBarMenuHeader extends Component<any, any> {
    render() {
        return (
            <h3 className="control-sidebar-heading">{this.props.title}</h3>
        );
    }
}
