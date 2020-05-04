import * as React from 'react';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class StyleProvider extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {};
  }
  render() {
    var props = {
      style: {
        display: 'flex',
        flex: '1 1 auto',
      },
      ...this.props
    };
    delete props.children
    return (
      <div style-provider={"style-provider"} {...props}>{this.props.children}</div>
    );
  }
}
