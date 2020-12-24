// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import {
	NodeProperties,
	NodeTypes,
	LinkEvents,
	LinkType,
	LinkProperties,
	GroupProperties,
	ReactNativeTypes,
	UITypes,
	GeneratedTypes
} from '../constants/nodetypes';
import {
	addValidatator,
	TARGET,
	createEventProp,
	GetNode,
	GetLinkChain,
	GetLinkChainItem,
	createExecutor,
	GetLinkBetween
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { DataChainContextMethods } from '../constants/datachain';
import { Node } from '../methods/graph_types';
import Generator from '../generators/generator';

class ScaffoldProject extends Component<any, any> {
	render() {
		var { state } = this.props;
		const code_types = [...Object.values(ReactNativeTypes), ...Object.values(GeneratedTypes)];
		let code_type_view = code_types.map((code_type) => {
			return <TreeViewMenu
				title={code_type}
				key={code_type}
				onClick={() => {
					Generator.generate({
						type: code_type,
						language: UITypes.ReactNative,
						state,
						writer: (temp: any) => {

						}
					});
				}}
			/>
		});
		return (
			<MainSideBar active={true} relative>
				<SideBar relative style={{ paddingTop: 0 }}>
					<SideBarMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'scaffold-project')}
							active={true}
							title={Titles.ScaffoldTargets}
							toggle={() => {
								this.props.toggleVisual('scaffold-project');
							}}
						>
							<TreeViewMenu
								title={'.Net Core'}
								onClick={() => {
									this.props.scaffoldProject({
										filesOnly: true,
										exclusive: true,
										netcore: true
									});
								}}
							/>
							<TreeViewMenu
								title={'React Native'}
								onClick={() => {
									this.props.scaffoldProject({
										filesOnly: true,
										exclusive: true,
										reactnative: true
									});
								}}
							/>
							<TreeViewMenu
								title={'React Web'}
								onClick={() => {
									this.props.scaffoldProject({
										filesOnly: true,
										exclusive: true,
										reactweb: true
									});
								}}
							/>
							<TreeViewMenu
								title={'Electron IO'}
								onClick={() => {
									this.props.scaffoldProject({
										filesOnly: true,
										exclusive: true,
										electrionio: true
									});
								}}
							/>
						</TreeViewMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'generate-project')}
							active={true}
							title={Titles.Generate}
							toggle={() => {
								this.props.toggleVisual('generate-project');
							}}>
							{code_type_view}
						</TreeViewMenu>
					</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(ScaffoldProject);
