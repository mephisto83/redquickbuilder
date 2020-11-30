// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import NodeList from './nodelist';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';

class PermissionMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Condition);

		if (!active) {
			return <div />;
		}
		return (
			<TabPane active={active}>
				<ControlSideBarMenuHeader title={Titles.ModelActions} />
			</TabPane>
		);
	}
}

export default UIConnect(PermissionMenu);
