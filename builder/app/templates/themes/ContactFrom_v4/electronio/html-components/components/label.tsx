import React, { Component } from 'react';
export default class Input extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <span className="label-input100">
                {this.props.children}
            </span>
        );
    }
}
