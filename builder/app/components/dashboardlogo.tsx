// @flow
import React, { Component } from 'react';


export default class Header extends Component<any, any> {
    render() {
        return (
            <a className="logo">
                <span className="logo-mini"><b>R</b>QB</span>
                <span className="logo-lg"><b>Red</b>QuickBuilder</span>
            </a>
        );
    }
}
