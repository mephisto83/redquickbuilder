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
    backgroundColor() {
        return this.props.backgroundColor ? this.props.backgroundColor : '';
    }
    render() {
        var style = {};
        var styleAll = {};
        if (this.props.maxheight) {
            style.maxHeight = `${this.props.maxheight}px`;
            style.overflowY = 'scroll';

        }

        if (this.backgroundColor()) {
            style.background = this.backgroundColor();
            styleAll.background = this.backgroundColor();
        }
        return (
            <div className={`box ${this.primary()}`} style={{ ...styleAll }}>
                <div className="box-header with-border" style={{ ...styleAll }}>
                    <h3 className="box-title" style={{ ...styleAll }}>{this.title()}</h3>
                </div>
                <div className="box-body" style={{ ...styleAll, ...style }}>
                    {this.props.children}
                </div>
                <div className="box-footer" style={{ ...styleAll }}>
                    {this.props.footer}
                </div>
            </div>
        );
    }
}
