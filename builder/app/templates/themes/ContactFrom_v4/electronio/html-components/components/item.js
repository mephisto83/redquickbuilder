import React, { Component } from "react";
export default class Label extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        className="wrap-input100 validate-input"
        data-validate="Name is required"
      >
        {this.props.children}
        <span className="focus-input100"></span>
      </div>
    );
  }
}
