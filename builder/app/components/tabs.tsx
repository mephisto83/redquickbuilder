// @flow
import React, { Component } from 'react';


export default class Tabs extends Component<any, any> {

    render() {
        return (
            <ul className="nav nav-tabs">
                {this.props.children}
            </ul>
        );
    }
}
