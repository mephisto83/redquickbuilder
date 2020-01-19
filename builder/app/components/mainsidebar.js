// @flow
import React, { Component } from "react";
import { RelativeMenuCss } from "../constants/visual";

export default class Header extends Component {
  relative() {
    return this.props.relative ? RelativeMenuCss : {};
  }
  overflow() {
    return this.props.overflow ? { maxHeight: "100vh", overflowY: "auto" } : {};
  }
  render() {
    if (this.props.notactive) {
      return <div />;
    }
    return (
      <aside
        className={`main-sidebar`}
        style={{ ...this.relative(), ...this.overflow() }}
      >
        <section className="sidebar" style={{ height: "auto" }}>
          {this.props.children}
        </section>
      </aside>
    );
  }
}
