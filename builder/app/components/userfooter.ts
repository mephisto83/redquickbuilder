// @flow
import React, { Component } from 'react';


export default class Tab extends Component {
    active() {
        return this.props.active ? 'active' : '';
    }
    title() {
        return this.props.title || this.props.children || '{title}';
    }
    render() {
        return (
            <li className="user-footer">
                {this.props.children} 
            </li>
        );
    }
}
