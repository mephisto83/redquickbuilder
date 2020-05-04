// @flow
import React, { Component } from 'react';


export default class SideBarContent extends Component<any, any> {
    render() {
        return (
            <ul className="tab-content">
                {this.props.children}
            </ul>
        );
    }
}
