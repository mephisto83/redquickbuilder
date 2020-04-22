// @flow
import React, { Component } from 'react';


export default class CheckBox extends Component {
  label() {
    return this.props.label || '{label}';
  }

  value() {
    return this.props.value || '';
  }

  title() {
    return this.props.title || '';
  }

  render() {
    return (
      <div className="form-group">
        <div className="checkbox">
          <label title={this.title()}>
            <input type="checkbox" style={(this.props.style || {})} checked={this.value()} onChange={(v) => {
              if (this.props.onChange) {
                this.props.onChange(v.target.checked);
              }
            }} />
            {this.label()}
          </label>
        </div>
      </div>
    );
  }
}
