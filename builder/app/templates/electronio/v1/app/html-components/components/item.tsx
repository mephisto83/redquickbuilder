import React, { Component } from 'react';
export default class Label extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}
