// @flow
import React, { Component } from 'react';


export default class Header extends Component {
    render() {
        return (
            <aside className="main-sidebar">
                <section className="sidebar" style={{ height: 'auto' }}>
                    {this.props.children}
                </section>
            </aside>
        );
    }
}
