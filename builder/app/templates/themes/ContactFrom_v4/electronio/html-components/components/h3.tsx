import * as React from "react";
import StyleProvider from "./styleprovider";

let navigationInstance;

export default class H3 extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      ...this.props
    };
    delete props.children;
    return <h3 {...props} className={'contact100-form-title'}>{this.props.children}</h3>;
  }
}
