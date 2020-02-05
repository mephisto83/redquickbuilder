import * as React from "react";
import StyleProvider from "./styleprovider";
import PropTypes from "prop-types";

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class SingleSelect extends React.Component {
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
      <ul className={"list-group"}>
        {(this.props.data || [])
          .map((item, index) => {
            if (this.props.renderItem) {
              let key = this.props.keyExtractor(item);
              let res = this.props.renderItem({ item, index, key });
              return (
                <li
                  onClick={() => {
                    if (this.props.onClick) {
                      this.props.onClick(item);
                    }
                  }}
                >
                  {res}
                </li>
              );
            }
          })
          .filter(x => x)}
      </ul>
    );
  }
}

SingleSelect.propTypes = {
  renderItem: function(v) {
    return typeof v === "function";
  },
  keyExtractor: function(v) {
    return typeof v === "function";
  },
  onClick: function(V) {
    return typeof v === "function";
  },
  data: function(v) {
    return Array.isArray(v);
  }
};