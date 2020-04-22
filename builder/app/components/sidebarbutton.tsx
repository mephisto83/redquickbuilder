// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


export default class SidebarButton extends Component {
    title() {
        return this.props.title || '';
    }
    icon() {
        return this.props.icon || '';
    }
    render() {
        var me = this;
        return (
            <a
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }}
                className={"sidebar-toggle"}
                data-toggle="push-menu" role="button">
                <span className="sr-only"><i className={this.icon()} /></span>
            </a>
        );
    }
}