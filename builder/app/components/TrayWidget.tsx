import * as React from 'react'; 
import styled from '@emotion/styled';
 
	export const STray = styled.div`
		min-width: 200px;
		max-height: calc(100vh - 380px);
		overflow-y: auto;
		background: rgb(20, 20, 20);
		flex: 1
	`;

export class TrayWidget extends React.Component {
	render() {
		return <STray>{this.props.children}</STray>;
	}
}
