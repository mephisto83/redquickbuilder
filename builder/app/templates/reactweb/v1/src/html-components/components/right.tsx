import * as React from 'react';
import StyleProvider from './styleprovider';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Right extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};
		delete props.children;
		return (
			<StyleProvider>
				<div {...props}>{this.props.children}</div>
			</StyleProvider>
		);
	}
}
