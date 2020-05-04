import * as React from "react";
import StyleProvider from "./styleprovider";

export default class Content extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      ...this.props
    };

    delete props.style;
    delete props.children;
    return (
      <div
        {...props}
        className={`${this.props.className || ""} wrap-contact100`}
      >
        {this.props.children}
      </div>
    );
  }
}
