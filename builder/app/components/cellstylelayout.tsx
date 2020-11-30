// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import ComponentStyle from './componentstyle';
import { CreateComponentStyle } from './componentstyle';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ComponentStyleComponent from './componentstylecomponent';
import GenericPropertyContainer from './genericpropertycontainer';
class CellStyleLayout extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let componentStyles: ComponentStyle[] = this.props.componentStyles;
		return (
			<GenericPropertyContainer sideBarStyle={{ right: 0 }} active title="asdf" subTitle="afaf">
				<TreeViewMenu
					open
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
								if (this.props.onChange) {
									this.props.onChange();
								}
								this.setState({ turn: UIA.GUID() });
							}}
							icon="fa fa-plus"
						/>
					</TreeViewButtonGroup>
					{(componentStyles || []).map((componentStyle: ComponentStyle) => {
						return (
							<ComponentStyleComponent
								key={componentStyle.id}
								api={this.props.api}
								parentId={this.props.parentId}
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
			</GenericPropertyContainer>
		);
	}
}

export default UIConnect(CellStyleLayout);
