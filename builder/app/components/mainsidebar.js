// @flow
import React, { Component } from 'react';
import { RelativeMenuCss } from '../constants/visual';


export default class Header extends Component {
    relative() {
        return this.props.relative ? RelativeMenuCss : {};
    }
    render() {
        return (
            <aside className={`main-sidebar`} style={this.relative()}>
                <section className="sidebar" style={{ height: 'auto' }}>
                    {this.props.children}
                </section>
            </aside>
        );
    }
}
