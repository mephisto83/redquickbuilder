// @flow
import React, { Component } from 'react';


export default class Box extends Component {
    label() {
        return this.props.label || '{label}';
    }
    value() {
        return this.props.value || '';
    }
    title() {
        return this.props.title || '{title}';
    }
    primary() {
        return this.props.primary ? 'box-primary' : '';
    }
    render() {
        return (
            <div className={`box ${this.primary()}`}>
                <div className="box-header with-border">
                    <h3 className="box-title">{this.title()}</h3>
                </div>
                <div className="box-body">
                    {this.props.children}
                </div>
                <div className="box-footer">
                    {this.props.footer}
                </div>
            </div>
        );
    }
}
