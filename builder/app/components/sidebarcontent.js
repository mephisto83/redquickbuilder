// @flow
import React, { Component } from 'react';


export default class SideBarContent extends Component {
    render() {
        return (
            <ul className="tab-content">
                {this.props.children}
            </ul>
        );
    }
}
