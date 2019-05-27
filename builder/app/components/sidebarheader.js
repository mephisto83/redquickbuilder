
// @flow
import React, { Component } from 'react';

export default class SideBarHeader extends Component {
    render() {
        return (<li className="header">{this.props.title}</li>);
    }
}
