// @flow
import React, { Component } from "react";

export default class TreeViewMenu extends Component {
  active() {
    return this.props.active ? "active" : "";
  }
  open() {
    return this.props.open ? "menu-open" : "";
  }
  display() {
    return this.props.open ? "block" : "block";
  }
  icon() {
    return (
      this.props.icon ||
      (this.props.children ? "fa fa-folder" : null) ||
      "fa fa-wrench"
    );
  }
  render() {
    return (
      <li
        title={this.props.description}
        className={`treeview ${this.active()} ${this.open()}`}
      >
        <a
          onClick={() => {
            if (this.props.toggle) this.props.toggle();
            if (this.props.onClick) {
              this.props.onClick();
            }
          }}
        >
          {this.props.hideIcon ? null : <i className={`${this.icon()}`} />}
          <span title={this.props.description || this.props.title}>
            {this.props.title}
          </span>
          {this.props.hideArrow || !this.props.children ? null : (
            <span className="pull-right-container">
              <i className="fa fa-angle-left pull-right" />
              {this.props.right ? this.props.right : null}
            </span>
          )}
          {!this.props.hideArrow && this.props.right ? null : (
            <span className="pull-right-container">
              {this.props.right ? this.props.right : null}
            </span>
          )}
        </a>
        <ul
          className="treeview-menu"
          style={{ display: this.display(), ...(this.props.innerStyle || {}) }}
        >
          {this.props.children}
        </ul>
      </li>
    );
  }
}