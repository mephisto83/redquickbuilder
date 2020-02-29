import * as React from "react";
import StyleProvider from "./styleprovider";

export default class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      ...this.props
    };

    delete props.children;
    return (
      <div className={`${this.props.className} ` + "container"} {...props}>
        {this.props.children}
      </div>
    );
  }
}
