
// @flow
import React, { Component } from 'react';

export default class SideBarHeader extends Component {
    render() {
        return (<li className="header" onClick={this.props.onClick}>{this.props.title}</li>);
    }
}
