

// @flow
import React, { Component } from 'react';


export default class TreeViewGroupButton extends Component {
    icon() {
        return this.props.icon || "fa fa-circle-o";
    }
    render() {
        return (
            <button title={this.props.title} type="button" onClick={() => {
                if (this.props.onClick) {
                    this.props.onClick();
                }
            }} className="btn btn-default btn-flat" style={{
                backgroundColor: 'transparent',
                borderColor: 'transparent'
            }}>
                <i className={this.props.icon} style={{ color: '#8aa4af' }}></i>
            </button>
        );
    }
}
