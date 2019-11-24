import * as React from 'react';
import StyleProvider from './styleprovider';

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
        delete props.children
        return (
            <StyleProvider>
                <button {...props}>{this.props.children}</button>
            </StyleProvider>
        );
    }
}
