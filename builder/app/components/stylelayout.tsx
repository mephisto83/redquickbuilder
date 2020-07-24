// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import ComponentStyle from './componentstyle';
import { CreateComponentStyle } from './componentstyle';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ComponentStyleComponent from './componentstylecomponent';
class StyleLayout extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let componentStyles: ComponentStyle[] = this.props.componentStyles;
		return (
			<TreeViewMenu
				open={this.state.open}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.ScreenEffects}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddScreenEffect}`}
						onClick={() => {
							componentStyles.push(CreateComponentStyle());

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(componentStyles || []).map((componentStyle: ComponentStyle) => {
					return (
						<ComponentStyleComponent
							api={this.props.api}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = componentStyles.findIndex((v) => v.id === componentStyle.id);
								if (index !== -1 && componentStyles) {
									componentStyles.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							componentStyle={componentStyle}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}

export default UIConnect(StyleLayout);
