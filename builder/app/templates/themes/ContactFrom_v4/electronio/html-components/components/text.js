import * as React from "react";
import StyleProvider from "./styleprovider";

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Text extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      ...this.props
    };
    delete props.children;
    return <span {...props}>{this.props.children}</span>;
  }
}
