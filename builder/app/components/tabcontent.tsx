// @flow
import React, { Component } from 'react';

export default class TabContent extends Component<any, any> {
    active() {
        return this.props.active ? 'active' : '';
    }
    render() {
        return (
            <div className={`tab-content`}>
                {this.props.children}
            </div>
        );
    }
}
