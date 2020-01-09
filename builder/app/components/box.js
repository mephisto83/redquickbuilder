// @flow
import React, { Component } from "react";

export default class Box extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  label() {
    return this.props.label || "{label}";
  }
  value() {
    return this.props.value || "";
  }
  title() {
    return this.props.title || "{title}";
  }
  primary() {
    return this.props.primary ? "box-primary" : "";
  }
  backgroundColor() {
    return this.props.backgroundColor ? this.props.backgroundColor : "";
  }
  render() {
    var style = {};
    var styleAll = {};
    var maxStyle = {};
    if (this.props.maxheight) {
      style.maxHeight = `${this.props.maxheight}px`;
      style.overflowY = "auto";
    }

    if (this.backgroundColor()) {
      style.background = this.backgroundColor();
      styleAll.background = this.backgroundColor();
    }

    return (
      <div
        className={`box ${this.primary()}`}
        style={{ ...styleAll, ...maxStyle }}
      >
        <div
          className="box-header with-border"
          style={{ ...styleAll }}
          onClick={() => {
            this.setState({ open: !this.state.open });
          }}
        >
          <h3 className="box-title" style={{ cursor: "pointer", ...styleAll }}>
            {this.title()}
          </h3>
        </div>
        <div className="box-body" style={{ ...styleAll, ...style }}>
          {this.state.open ? null : this.props.children}
        </div>
        <div className="box-footer" style={{ ...styleAll }}>
          {this.props.footer}
        </div>
      </div>
    );
  }
}
