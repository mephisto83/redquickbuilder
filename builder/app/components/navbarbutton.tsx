/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';


export default class NavBarButton extends Component<any, any> {
  icon() {
    return this.props.icon || "fa fa-gears"
  }

  title() {
    return this.props.title || '';
  }

  render() {
    return (
      <li>
        <a onClick={() => {
          if (this.props.onClick) {
            this.props.onClick();
          }
        }} title={this.title()} style={{ position: 'relative' }} data-toggle="control-sidebar">
          <i className={this.icon()} />
          {this.props.secondaryicon ? <i className={this.props.secondaryicon} style={{
            position: 'absolute',
            left: 10,
            top: 10,
            fontSize: '10px',
            zIndex: 10
          }} /> : null}
        </a>
      </li>
    );
  }
}
