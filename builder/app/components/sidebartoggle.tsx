// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


class SidebarToggle extends Component<any, any> {
    render() {
        var me = this;
        return (
            <a
                onClick={() => {
                    me.props.toggleDashboardMinMax();
                }}
                className="sidebar-toggle"
                data-toggle="push-menu" role="button">
                <span className="sr-only">Toggle navigation</span>
            </a>
        );
    }
}
export default UIConnect(SidebarToggle);
