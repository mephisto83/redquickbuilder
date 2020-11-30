// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import SideMenuContainer from './sidemenucontainer';
import * as Titles from './titles';
import CheckBoxProperty from './checkboxproperty';
import { NodeProperties, NodeTypes, MediaQueries, StyleNodeProperties } from '../constants/nodetypes';
import FormControl from './formcontrol';
import SideBar from './sidebar';
import SideBarMenu from './sidebarmenu';
import SideBarContent from './sidebarcontent';
import { StyleLib } from '../constants/styles';
import TextInput from './textinput';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewMenu from './treeviewmenu';
import SelectProperty from './selectproperty';
import GenericPropertyContainer from './genericpropertycontainer';
import GridAreaSelect from './gridareaselect';
import GridPlacement from './gridplacement';
class StyleMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Style);
		if (!active) {
			return <div />;
		}
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (!currentNode || !active) {
			return <TabPane active={active} />;
		}
		let cellStyle = UIA.GetNodeProp(currentNode, UIA.NodeProperties.Style) || {};
		return (
			<SideBarMenu relative={true}>
				<GenericPropertyContainer active={true} title="asdf" subTitle="afaf" nodeType={NodeTypes.Selector}>
					<TreeViewMenu
						open={UIA.Visual(state, Titles.Selector)}
						active={true}
						title={Titles.Selector}
						toggle={() => {
							this.props.toggleVisual(Titles.Selector);
						}}
					>
						{StyleNodeProperties.map((x) => {
							return (
								<TreeViewItemContainer key={x}>
									<CheckBoxProperty title={x} node={currentNode} property={x} />
								</TreeViewItemContainer>
							);
						})}
					</TreeViewMenu>
				</GenericPropertyContainer>
				<GenericPropertyContainer active={true} title="asdf" subTitle="afaf" nodeType={NodeTypes.Selector}>
					<TreeViewMenu
						open={UIA.Visual(state, Titles.MediaQuery)}
						active={true}
						title={Titles.MediaQuery}
						toggle={() => {
							this.props.toggleVisual(Titles.MediaQuery);
						}}
					>
						{[ NodeProperties.UseMediaQuery ].map((x) => {
							return (
								<TreeViewItemContainer key={x}>
									<CheckBoxProperty title={x} node={currentNode} property={x} />
								</TreeViewItemContainer>
							);
						})}
						<TreeViewItemContainer>
							<SelectProperty
								title={Titles.MediaQuery}
								options={Object.keys(MediaQueries).map((v) => ({
									title: v,
									id: v,
									value: v
								}))}
								node={currentNode}
								property={NodeProperties.MediaQuery}
							/>
						</TreeViewItemContainer>
					</TreeViewMenu>
				</GenericPropertyContainer>
				<GenericPropertyContainer active={true} title="asdf" subTitle="afaf" nodeType={NodeTypes.Style}>
					<TreeViewMenu
						open={UIA.Visual(state, Titles.Style)}
						active={true}
						title={Titles.Style}
						toggle={() => {
							this.props.toggleVisual(Titles.Style);
						}}
					>
						<TreeViewItemContainer>
							<FormControl>
								<TextInput
									value={this.state.filter}
									label={Titles.Filter}
									immediate={true}
									onChange={(value: any) => {
										this.setState({ filter: value });
									}}
									placeholder={Titles.Filter}
								/>
								{this.getStyleSelect()}
								{cellStyle && currentNode ? (
									this.selectedStyle((value) => {
										cellStyle[this.state.selectedStyleKey] = value;
										this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
											prop: UIA.NodeProperties.Style,
											id: currentNode.id,
											value: cellStyle
										});
									}, cellStyle[this.state.selectedStyleKey])
								) : null}
								{cellStyle ? this.getCurrentStyling(cellStyle) : null}
							</FormControl>
						</TreeViewItemContainer>
					</TreeViewMenu>
					{currentNode ? (
						<TreeViewMenu
							open={UIA.Visual(state, Titles.GridAreas)}
							active={true}
							title={Titles.GridAreas}
							toggle={() => {
								this.props.toggleVisual(Titles.GridAreas);
							}}
						>
							<TreeViewItemContainer>
								<GridAreaSelect node={currentNode} />
							</TreeViewItemContainer>
						</TreeViewMenu>
					) : null}
					{currentNode ? (
						<TreeViewMenu
							open={UIA.Visual(state, Titles.GridRow)}
							active={true}
							title={Titles.GridRow}
							toggle={() => {
								this.props.toggleVisual(Titles.GridRow);
							}}
						>
							<TreeViewItemContainer>
								<SelectProperty
									title={Titles.Rows}
									options={[].interpolate(0, 10, (x) => x).map((v) => ({
										title: v,
										id: v,
										value: v
									}))}
									node={currentNode}
									property={NodeProperties.GridRowCount}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<GridPlacement node={currentNode} />
							</TreeViewItemContainer>
						</TreeViewMenu>
					) : null}
				</GenericPropertyContainer>
			</SideBarMenu>
		);
	}
	selectedStyle(callback, value) {
		if (this.state.selectedStyleKey) {
			switch (this.state.selectedStyleKey) {
				default:
					return (
						<TextInput
							value={value}
							immediate={true}
							label={this.state.selectedStyleKey}
							onChange={callback}
							placeholder={Titles.Filter}
						/>
					);
			}
		}
		return null;
	}
	getStyleSelect() {
		if (this.state.filter) {
			return (
				<ul style={{ padding: 2, maxHeight: 200, overflowY: 'auto' }}>
					{Object.keys(StyleLib.js).filter((x) => x.indexOf(this.state.filter) !== -1).map((key) => {
						return (
							<li
								className={'treeview'}
								style={{ padding: 3, cursor: 'pointer' }}
								label={'Style'}
								key={key}
								onClick={() => {
									this.setState({ selectedStyleKey: key, filter: '' });
								}}
							>
								{key}
							</li>
						);
					})}
				</ul>
			);
		}
		return [];
	}
	getCurrentStyling(currentStyle) {
		if (currentStyle) {
			return (
				<ul style={{ padding: 2, maxHeight: 400, overflowY: 'auto' }}>
					{Object.keys(currentStyle).map((key) => {
						return (
							<li
								className={'treeview'}
								style={{ padding: 3, cursor: 'pointer' }}
								key={key}
								onClick={() => {
									this.setState({ selectedStyleKey: key, filter: '' });
								}}
							>
								[{key}]:
								<div>{currentStyle[key]}</div>
								<hr style={{ padding: 0, margin: 0 }} />
							</li>
						);
					})}
				</ul>
			);
		}
		return [];
	}
}

export default UIConnect(StyleMenu);
