import * as React from 'react';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;
import StyleProvider from './styleprovider';

export default class StyleSheet extends React.Component {
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
            <StyleProvider>
                <li {...props}>{this.props.children}</li>
            </StyleProvider>
        );
    }
}
