import * as React from "react";
import StyleProvider from "./styleprovider";

export default class Content extends React.Component {
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
      <form {...props} className={`${this.props.className} contact100-form validate-form`}>
        {this.props.children}
      </form>
    );
  }
}
