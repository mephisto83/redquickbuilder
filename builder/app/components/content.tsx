// @flow
import React, { Component } from 'react';


export default class Content extends Component<any, any> {
    render() {
        return (
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                {this.props.children}
            </div>
        );
    }
}
