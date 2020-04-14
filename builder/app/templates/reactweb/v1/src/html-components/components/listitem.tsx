import * as React from "react";
import StyleProvider from "./styleprovider";

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class ListItem extends React.Component {
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
      <li className="list-group-item" {...props}>
        {this.props.children}
      </li>
    );
  }
}
