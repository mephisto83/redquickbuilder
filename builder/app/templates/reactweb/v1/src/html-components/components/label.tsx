import React, { Component } from 'react';
export default class Input extends Component {
    constructor(props) {
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