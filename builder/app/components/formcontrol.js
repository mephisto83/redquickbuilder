// @flow
import React, { Component } from 'react';


export default class FormControl extends Component {
    render() {
        return (
            <form role="form">
                {this.props.children}
            </form>
        );
    }
}
