import * as React from "react";
import StyleProvider from "./styleprovider";

// ExecuteButtonWorkoutStationsComponent
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
    return <h2 {...props}>{this.props.children}</h2>;
  }
}
