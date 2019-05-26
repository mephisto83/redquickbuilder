// @flow
import React, { Component } from 'react';


export default class TextInput extends Component {
    label() {
        return this.props.label || '{label}';
    }
    value() {
        return this.props.value || '';
    }
    placeholder() {
        return this.props.placeholder || '';
    }
    render() {
        return (
            <div className={this.props.inputgroup ? 'input-group' : "form-group"}>
                {this.props.inputgroup ? null : <label>{this.label()}</label>}
                <input type="text" className={"form-control"} value={this.value()} onChange={(v) => {
                    if (this.props.onChange) {
                        this.props.onChange(v.target.value);
                    }
                }} placeholder={this.placeholder()} />
                {this.props.inputgroup ? (<span className="input-group-btn">
                    <button type="submit" onClick={() => {
                        if (this.props.onClick) {
                            this.props.onClick();
                        }
                    }} name="search" id="search-btn" className="btn btn-flat"><i className="fa fa-edit"></i>
                    </button>
                </span>) : null}
            </div>
        );
    }
}
