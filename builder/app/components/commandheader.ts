

// @flow
import React, { Component } from 'react';
import TabPane from './tabpane';
import { UIConnect } from '../utils/utils';


class CommandHeader extends Component {
    icon() {
        if (this.props.open) {
            return this.props.icon || 'fa fa-angle-down';
        }
        return this.props.icon || 'fa fa-angle-left';
    }
    render() {
        return (
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: 1, flexDirection: 'row' }} onClick={() => {
                this.props.toggleVisual(this.props.visual);
            }}><h4 style={{ flex: 1 }}>{this.props.title}</h4>
                <i className={`menu-icon ${this.icon()}`}></i></div>
        );
    }
}
export default UIConnect(CommandHeader)