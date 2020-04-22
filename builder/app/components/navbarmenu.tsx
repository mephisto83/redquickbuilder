// @flow
import React, { Component } from 'react';


export default class NavBarMenu extends Component {
    render() {
        let style = {};
        if (this.props.paddingRight) {
            style.paddingRight = this.props.paddingRight;
        }
        if (this.props.style) {
            style = { ...style, ...this.props.style };
        }
        return (
            <div className="navbar-custom-menu" style={style}>
                <ul className="nav navbar-nav">
                    {this.props.children}
                </ul>
            </div>
        );
    }
}
