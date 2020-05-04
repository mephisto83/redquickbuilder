// @flow
import React, { Component } from 'react';


export default class Header extends Component<any, any> {
    render() {
        return (
            <header className="main-header">
                {this.props.children}
            </header>
        );
    }
}
