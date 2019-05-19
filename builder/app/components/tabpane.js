// @flow
import React, { Component } from 'react';

export default class TabPane extends Component {
    active() {
        return this.props.active ? 'active' : '';
    }
    render() {
        return (
            <div className={`tab-pane ${this.active()}`}>
                {this.props.active ? this.props.children : null}
            </div>
        );
    }
}
