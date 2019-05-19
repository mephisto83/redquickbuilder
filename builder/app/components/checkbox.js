// @flow
import React, { Component } from 'react';


export default class CheckBox extends Component {
    label() {
        return this.props.label || '{label}';
    }
    value() {
        return this.props.value || '';
    }
    render() {
        return (
            <div className="form-group">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" checked={this.value()} onChange={(v) => {
                            if (this.props.onChange) {
                                this.props.onChange(v.target.checked);
                            }
                        }} />
                        {this.label()}
                    </label>
                </div>
            </div>
        );
    }
}
