// @flow
import React, { Component } from 'react';


export default class Content extends Component {
    render() {
        return (
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                {this.props.children}
            </div>
        );
    }
}
