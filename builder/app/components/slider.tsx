// @flow
import React, { Component } from 'react';


export default class Slider extends Component<any, any> {
    min() {
        return this.props.min || "1";
    }
    max() {
        return this.props.max || "100";
    }
    value() {
        return this.props.value || '';
    }
    render() {
        return (
            <div className="slidecontainer">
                <input type="range" min={this.min()} onChange={(evt) => {
                    if (this.props.onChange && !isNaN(evt.target.value)) {
                        this.props.onChange(parseFloat(evt.target.value));
                    }
                }} max={this.max()} value={this.value()} className="slider" />
            </div>
        );
    }
}
