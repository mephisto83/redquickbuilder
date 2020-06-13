// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import { LinkPropertyKeys } from '../constants/nodetypes';
import TreeViewMenu from './treeviewmenu';
import TreeViewItemContainer from './treeviewitemcontainer';

const MAX_CONTENT_MENU_HEIGHT = 500;
class EnumerationLinkMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { value: '' };
	}
	render() {
		var { linkType, title, state, selectedLink, enumeration, link, linkKey } = this.props;

		return (
			<TreeViewMenu
				open={UIA.Visual(state, title)}
				active
				title={title}
				key={`${linkKey}${selectedLink.id}`}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				toggle={() => {
					this.props.toggleVisual(title);
				}}
			>
				{enumeration.map((enumer: any) => {
					let currentValue = UIA.GetLinkProperty(link, linkKey) || [];
					return (
						<TreeViewItemContainer key={enumer.id}>
							<CheckBox
								label={enumer.value}
								value={currentValue.indexOf(enumer.id) !== -1}
								onChange={(value: any) => {
									this.props.graphOperation([
										{
											operation: UIA.UPDATE_LINK_PROPERTY,
											options() {
												return {
													id: link.id,
													prop: linkKey,
													value: value
														? [ ...currentValue, enumer.id ]
														: [ ...currentValue.filter((x: any) => x !== enumer.id) ]
												};
											}
										}
									]);
								}}
							/>
						</TreeViewItemContainer>
					);
				})}
			</TreeViewMenu>
		);
	}
}

export default UIConnect(EnumerationLinkMenu);
