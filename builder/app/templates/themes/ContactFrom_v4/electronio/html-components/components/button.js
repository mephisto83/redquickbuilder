import * as React from "react";
import StyleProvider from "./styleprovider";

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Button extends React.Component {
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
      <div className="container-contact100-form-btn">
        <div className="wrap-contact100-form-btn">
          <div className="contact100-form-bgbtn" />
          <button {...props} type="button" className="contact100-form-btn">
            <span>
              {this.props.children}
              <i className="fa fa-long-arrow-right m-l-7" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    );
  }
}
