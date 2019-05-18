// @flow
import React, { Component } from 'react';


export default class NavBarMenu extends Component {
    render() {
        return (
            <div className="navbar-custom-menu">
                <ul className="nav navbar-nav">
                    {this.props.children}
                </ul>
            </div>
        );
    }
}
