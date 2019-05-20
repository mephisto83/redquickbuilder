// @flow
import React, { Component } from 'react';

export default class TabContainer extends Component {

    render() {
        return (
            <div className={`nav-tabs-custom`}>
                {this.props.children}
            </div>
        );
    }
}
