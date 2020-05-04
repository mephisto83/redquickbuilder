

// @flow
import React, { Component } from 'react';


export default class TreeViewButtonGroup extends Component<any, any> {
    icon() {
        return this.props.icon || "fa fa-circle-o";
    }
    render() {
        return (
            <li>
                <a onClick={() => {
                    if (this.props.onClick)
                        this.props.onClick();
                }}>
                    <div className="btn-group">
                        {this.props.children}
                    </div>
                </a>
            </li>
        );
    }
}
