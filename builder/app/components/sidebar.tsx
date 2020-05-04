// @flow
import React, { Component } from "react";
import { RelativeMenuCss } from "../constants/visual";
import { Paused } from "../methods/graph_methods";

export default class SideBar extends Component<any, any> {
  open() {
    return this.props.open ? "control-sidebar-open" : "";
  }
  extraWidth() {
    return this.props.extraWide ? "extra-wide" : "";
  }
  relative() {
    return this.props.relative ? RelativeMenuCss : {};
  }

  render() {
    return (
      <aside
        style={{
          ...this.relative(),
          minHeight: "auto",
          ...(this.props.style || {})
        }}
        className={`control-sidebar control-sidebar-dark ${this.open()} ${this.extraWidth()}`}
      >
        {!Paused() ? this.props.children : null}
      </aside>
    );
  }
}
