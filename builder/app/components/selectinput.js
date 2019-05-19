// @flow
import React, { Component } from 'react';


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
                <label>Select</label>
                <select className="form-control" onChange={(evt) => {
                    if (this.props.onChange) {
                        this.props.onChange(evt.target.value);
                    }
                }} value={this.value()}>
                    {/* <option>option 1</option>
                    <option>option 2</option>
                    <option>option 3</option>
                    <option>option 4</option>
                    <option>option 5</option> */}
                    {this.options()}
                </select>
            </div>
        );
    }
}
