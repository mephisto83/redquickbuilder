import * as React from 'react';
import StyleProvider from './styleprovider';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Footer extends React.Component {
    constructor(props: any) {
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
                <div {...props}>{this.props.children}</div>
            </StyleProvider>
        );
    }
}
