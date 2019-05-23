// @flow
import React, { Component } from 'react';


export default class NavBarButton extends Component {
    icon() {
        return this.props.icon || "fa fa-gears"
    }
    title(){
        return this.props.title || '';
    }
    render() {
        return (
            <li>
                <a onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }} title={this.title()} data-toggle="control-sidebar">
                    <i className={this.icon()}></i>
                </a>
            </li>
        );
    }
}
