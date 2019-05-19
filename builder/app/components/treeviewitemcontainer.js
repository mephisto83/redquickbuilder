// @flow
import React, { Component } from 'react';


export default class TreeViewItemContainer extends Component {
    icon() {
        return this.props.icon || "fa fa-circle-o";
    }
    render() {
        return (
            <li>
                {this.props.title}
                {this.props.children}
            </li>
        );
    }
}
