// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties } from '../constants/nodetypes';
import { Iterator } from 'webcola';
class ReferenceActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = !!(UIA.Application(state, UIA.GRAPH_SCOPE) || []).length;

		if (!active) {
			return <div />;
		}
		var referencable_nodes = (UIA.NodesByType(state, NodeTypes.Model, { useRoot: true }) || []).map((t) => {
			return {
				title: UIA.GetNodeTitle(t),
				value: t.id
			};
		});
		return (
			<TabPane active={active}>
				<FormControl>
					<SelectInput
						label={Titles.AddReference}
						options={referencable_nodes}
						onChange={(id) => {
							var node = UIA.GetNodeFromRoot(state, id);
							this.props.graphOperation([
								{
									operation: UIA.ADD_NEW_REFERENCE_NODE,
									options: {
										node,
										rootNode: UIA.GetRootGraph(state)
									}
								}
							]);
							// this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
							//     target: currentNode.properties[UIA.NodeProperties.UIDependsOn],
							//     source: id
							// })
							// this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
							//     prop: UIA.NodeProperties.UIDependsOn,
							//     id,
							//     value
							// });
							// this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
							//     target: value,
							//     source: id,
							//     properties: { ...UIA.LinkProperties.DependsOnLink }
							// });
						}}
						value={''}
					/>
				</FormControl>
			</TabPane>
		);
	}
}

export default UIConnect(ReferenceActivityMenu);
