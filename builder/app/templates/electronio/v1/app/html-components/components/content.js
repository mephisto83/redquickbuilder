import * as React from 'react';
import StyleProvider from './styleprovider';

export default class Content extends React.Component {
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
                <div {...props}>{this.props.children}</div>
            </StyleProvider>
        );
    }
}
