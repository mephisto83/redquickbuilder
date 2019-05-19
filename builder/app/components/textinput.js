// @flow
import React, { Component } from 'react';


export default class TextInput extends Component {
    label() {
        return this.props.label || '{label}';
    }
    value() {
        return this.props.value || '';
    }
    render() {
        return (
            <div className="form-group">
                <label>{this.label()}</label>
                <input type="text" className="form-control" value={this.value()} onChange={(v) => {
                    if (this.props.onChange) {
                        this.props.onChange(v.target.value);
                    }
                }} placeholder="Enter ..." />
            </div>
        );
    }
}
