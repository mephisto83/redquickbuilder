import * as React from "react";
import StyleProvider from "./styleprovider";

let navigationInstance;

export default class H2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      ...this.props
    };
    delete props.children;
    return <span {...props} className={'contact100-form-title'}>{this.props.children}</span>;
  }
}
