import * as React from "react";

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
      <div className="container-contact100" {...props}>
        {this.props.children}
      </div>
    );
  }
}
