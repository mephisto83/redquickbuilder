// @flow
import React, { Component } from 'react';


export default class DropDownMenuItem extends Component {

    icon() {
        return this.props.icon || "fa fa-envelope-o"
    }
    render() {
        return (
            <li>
                <a>
                    <div className="pull-left">
                        <i style={{ fontSize: 34 }} className={this.icon()}></i>
                    </div>
                    <h4>
                        {this.props.title}
                        {/* <small><i className="fa fa-clock-o"></i> 5 mins</small> */}
                    </h4>
                    <p>{this.props.description}</p>
                </a>
            </li>
        );
    }
}
