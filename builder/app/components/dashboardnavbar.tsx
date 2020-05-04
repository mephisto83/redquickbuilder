// @flow
import React, { Component } from 'react';


export default class Header extends Component<any, any> {
    render() {
        return (
            <nav className="navbar navbar-static-top">
                {this.props.children}
            </nav>
        );
    }
}
