// @flow
import React, { Component } from 'react';


export default class TreeViewItem extends Component {
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
                    <i className={this.icon()}></i>
                    {this.props.title}
                </a>
            </li>
        );
    }
}
