// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import { GetLinkBetween } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { Node } from '../methods/graph_types';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { CommandCenter } from '../jobs/interfaces';
import CommandCenterConfiguration from './commandcenterconfiguration';

class RedQuickConfigurationComponent extends Component<any, any> {
	componentDidMount() {
		this.props.loadRedQuickConfiguration();
	}
	render() {
		var { state } = this.props;

		let redQuickConfig: UIA.RedQuickConfiguration =
			UIA.Visual(state, UIA.RED_QUICK_CONFIG) || UIA.createRedQuickConfiguration();
		redQuickConfig.commandCenters = redQuickConfig.commandCenters || [];
		return (
			<MainSideBar active={true} relative={true}>
				<SideBar style={{ paddingTop: 0 }}>
					<SideBarMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'RED_QUICK_CONFIGURATION')}
							active={true}
							title={Titles.RedQuickConfigurations}
							innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('RED_QUICK_CONFIGURATION');
							}}
						>
							<TreeViewMenu
								open={UIA.Visual(state, 'Command Connections')}
								active={true}
								title={Titles.CommandCenters}
								toggle={() => {
									this.props.toggleVisual('Command Connections');
								}}
							>
								{redQuickConfig.commandCenters.map((commandCenter: CommandCenter, index: number) => {
									return (
										<CommandCenterConfiguration
											commandCenter={commandCenter}
											onChange={() => {
												this.setState({
													turn: UIA.GUID()
                        });
                        this.props.updateRedQuickConfiguration(redQuickConfig);
											}}
											onRemove={() => {
												redQuickConfig.commandCenters = redQuickConfig.commandCenters.filter(
													(v) => v.id !== commandCenter.id
												);
											}}
										/>
									);
								})}
							</TreeViewMenu>
							<TreeViewButtonGroup>
								<TreeViewGroupButton
									title={`${Titles.Add}`}
									onClick={() => {
										redQuickConfig.commandCenters.push(UIA.createCommandCenter());
										this.setState({ turn: UIA.GUID() });
                    this.props.updateRedQuickConfiguration(redQuickConfig);
									}}
									icon="fa fa-plus"
								/>
							</TreeViewButtonGroup>
						</TreeViewMenu>
					</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(RedQuickConfigurationComponent);
