import * as React from 'react';
import StyleProvider from './styleprovider';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class ListItem extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
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
			<StyleProvider>
				<li {...props}>{this.props.children}</li>
			</StyleProvider>
		);
	}
}
