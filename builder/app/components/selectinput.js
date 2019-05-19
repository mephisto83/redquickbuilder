// @flow
import React, { Component } from 'react';
import * as Titles from './titles';

export default class SelectInput extends Component {
    label() {
        return this.props.label || '{label}';
    }
    value() {
        return this.props.value || '';
    }
    options() {
        if (this.props.options) {
            return this.props.options.map((t, index) => {
                return (<option key={`option-${index}`} value={t.value}>{t.title}</option>)
            })
        }
        return [];
    }
    render() {
        return (
            <div className="form-group">
                <label>{this.label()}</label>
                <select className="form-control" onSelect={(evt) => {
                    if (this.props.onChange) {
                        this.props.onChange(evt.target.value);
                    }
                }}
                    onChange={(evt) => {
                        if (this.props.onChange) {
                            this.props.onChange(evt.target.value);
                        }
                    }} value={this.value()}>
                    <option value={null}>{Titles.Select}</option>
                    {this.options()}
                </select>
            </div>
        );
    }
}
