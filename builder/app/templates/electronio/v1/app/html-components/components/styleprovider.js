import * as React from 'react';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class StyleProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children
        return (
            <div style-provider={"style-provider"} {...props}>{this.props.children}</div>
        );
    }
}
