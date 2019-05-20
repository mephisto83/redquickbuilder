// @flow
import React, { Component } from 'react';


export default class Tab extends Component {
    active() {
        return this.props.active ? 'active' : '';
    }
    title() {
        return this.props.title || this.props.children || '{title}';
    }
    render() {
        return (
            <li className={this.active()}>
                <a data-toggle="tab" onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick();
                    }
                }} aria-expanded="true">{this.title()}</a>
            </li>
        );
    }
}
