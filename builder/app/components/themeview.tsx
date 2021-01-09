/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';
import { StyleLib } from '../constants/styles';

import {
	ThemeColors,
	FormThemePropertyKeys,
	HTMLElementGroups,
	ColorUses,
	OtherUses,
	CssPseudoSelectors
} from '../constants/themes';
import { GetCssName, GetCurrentGraph, GUID, NodesByType, NodeTypes, VisualEq } from '../actions/uiActions';
import TextInput from './textinput';
import ColorInput from './colorinput';
import Box from './box';
import FormControl from './formcontrol';
import * as Titles from './titles';
import SelectInput from './selectinput';
import { ComponentTags } from '../constants/componenttypes';
import CheckBox from './checkbox';
import ButtonList from './buttonlist';
import Typeahead from './typeahead';
import { MediaQueries, NodeProperties } from '../constants/nodetypes';
import GridPlacementField from './gridplacementfield';
import ThemeStyleSection from './themestylesection';
import TabContainer from './tabcontainer';
import GenericPropertyContainer from './genericpropertycontainer';
import Tabs from './tabs';
import TabContent from './tabcontent';
import TabPane from './tabpane';
import Tab from './tab';
import { cssToJson, GetColors, JSONNode, Children } from '../methods/cssToJSON';
import { Node } from '../methods/graph_types';
import { GetNodeLinkedTo, GetNodeProp, GetNodesLinkedTo } from '../methods/graph_methods';
import TreeViewMenu from './treeviewmenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Panel from './panel';
const THEME_VIEW_TAB = 'theme-view-tab';
const ResponsiveGridLayout = WidthProvider(Responsive);

class ThemeView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		const Deflayout = [
			{ i: 'a', x: 3, y: 0, w: 9, h: 3 },
			{ i: 'b', x: 3, y: 3, w: 7, h: 4 },
			{ i: 'c', x: 0, y: 4, w: 3, h: 4 }
		];
		const layout = {
			lg: Deflayout
		};
		this.state = {
			quickColor: '', bindAll: true, mediaSize: MediaQueries['Extra devices'], modelPropertyClasses: [],
			layout,
			otherLayout: JSON.parse(JSON.stringify(Deflayout))
		};
	}

	active() {
		return !!this.props.active;
	}

	getEditBoxes(formType: any, mediaSize: any, formTheme: any, themeColors: any, config: any, themeVariables: any, filterFunc: any) {
		// ComponentTags
		if (formType && mediaSize) {
			return Object.values(StyleLib.css)
				.filter(
					(v: any) =>
						(formTheme &&
							formTheme[formType] &&
							formTheme[formType][mediaSize] &&
							formTheme[formType][mediaSize][v.label]) ||
						filterFunc(`${v.label}`)
				)
				.map((field) => {
					const { placeholder, key, type }: any = field;
					let { label }: any = field;
					label = `${label}`;
					formType = `${formType}${this.getAttrSelector()}`;

					const onChange = (value: any) => {
						if (!formTheme[formType]) {
							formTheme[formType] = {};
						}

						if (!formTheme[formType][mediaSize]) {
							formTheme[formType][mediaSize] = {};
						}

						if (!formTheme[formType][mediaSize][key]) {
							formTheme[formType][mediaSize][key] = {};
						}

						formTheme[formType][mediaSize][key] = value;

						Object.keys(MediaQueries).forEach((ms) => {
							if (!formTheme[formType][ms]) {
								formTheme[formType][ms] = {};
							}
							if (this.state.bindAll) {
								formTheme[formType][ms][key] = value;
							} else {
								formTheme[formType][ms][key] = formTheme[formType][ms][key] || value;
							}
						});

						this.props.updateGraph('spaceTheme', formTheme);
					};
					const fieldValue =
						formTheme[formType] && formTheme[formType][mediaSize]
							? formTheme[formType][mediaSize][key]
							: null;

					if (type === 'color') {
						return (
							<SelectInput
								key={`field-color-${key}`}
								value={fieldValue}
								label={label}
								title={label}
								color={themeColors ? themeColors[`${fieldValue}`.split('--').join('')] : null}
								onChange={onChange}
								options={Object.keys(ThemeColors).map((d) => ({ title: d, value: `--${d}` }))}
							/>
						);
					}
					const use = key;
					const variableNameParts = `${label.split(':')[0]}`.split('-').map((v) => v.toLowerCase());
					if (!variableNameParts.some((v) => use.toLowerCase().indexOf(v) === -1)) {
						return (
							<Typeahead
								key={`field-font-family-${use}`}
								value={fieldValue}
								label={use}
								title={use}
								onChange={onChange}
								options={themeVariables.variables
									.filter(
										(t: any) =>
											!variableNameParts.some((v) => t.variable.toLowerCase().indexOf(v) === -1)
									)
									.map((d: any) => ({
										title: d.variable,
										value: d.variable
									}))}
							/>
						);
					}
					return (
						<TextInput
							key={`field-${key}`}
							value={fieldValue}
							label={label}
							title={label}
							onChange={onChange}
							placeholder={placeholder}
						/>
					);
				});
		}
		return [];
	}

	getAttrSelector() {
		let selector = '';

		Object.keys(CssPseudoSelectors).filter((v) => this.state[v]).sort().forEach((v) => {
			selector += v;
		});

		return selector;
	}

	getSpaceFields(formType: any, mediaSize: any, formTheme: any, themeColors: any = {}, themeVariables: any, filterFunc: any) {
		// ComponentTags
		if (formType && mediaSize) {
			return Object.values(StyleLib.css)
				.filter(
					(v: any) =>
						(formTheme &&
							formTheme[formType] &&
							formTheme[formType][mediaSize] &&
							formTheme[formType][mediaSize][v.label]) ||
						filterFunc(`${v.label}`)
				)
				.map((field) => {
					const { placeholder, key, type }: any = field;
					let { label }: any = field;
					label = `${label}`;
					formType = `${formType}${this.getAttrSelector()}`;

					const onChange = (value: any) => {
						value = `${value || ''}`;

						if (!formTheme[formType]) {
							formTheme[formType] = {};
						}

						if (!formTheme[formType][mediaSize]) {
							formTheme[formType][mediaSize] = {};
						}

						if (!formTheme[formType][mediaSize][key]) {
							formTheme[formType][mediaSize][key] = {};
						}

						formTheme[formType][mediaSize][key] = value;

						Object.keys(MediaQueries).forEach((ms) => {
							if (!formTheme[formType][ms]) {
								formTheme[formType][ms] = {};
							}
							if (this.state.bindAll) {
								formTheme[formType][ms][key] = value;
							} else {
								formTheme[formType][ms][key] = formTheme[formType][ms][key] || value;
							}
						});

						this.props.updateGraph('spaceTheme', formTheme);
					};
					const fieldValue =
						formTheme[formType] && formTheme[formType][mediaSize]
							? formTheme[formType][mediaSize][key]
							: null;
					if (type === 'color') {
						let options = Object.keys(ThemeColors).map((d) => ({ title: d, value: `--${d}` }));
						return (
							<SelectInput
								key={`field-color-${key}`}
								value={fieldValue}
								label={label}
								title={label}
								immediate={!options.length}
								color={themeColors ? themeColors[`${fieldValue}`.split('--').join('')] : null}
								onChange={onChange}
								options={options}
							/>
						);
					}

					const use = key;
					const variableNameParts = `${label.split(':')[0]}`.split('-').map((v) => v.toLowerCase());
					if (!variableNameParts.some((v) => use.toLowerCase().indexOf(v) === -1)) {
						let options = [...themeVariables.variables
							.filter(
								(t: any) =>
									!variableNameParts.some((v) => t.variable.toLowerCase().indexOf(v) === -1)
							)
							.map((d: any) => ({
								title: d.variable,
								value: d.variable
							}))];
						if (this.state.currentFieldValue) {
							options.push({
								title: this.state.currentFieldValue,
								value: this.state.currentFieldValue
							})
						}
						return (
							<Typeahead
								key={`field-font-family-${use}`}
								value={fieldValue}
								label={use}
								title={use}
								onChange={onChange}
								onChangeText={(value: string) => {
									this.setState({
										currentFieldValue: value
									});
								}}
								options={options}
							/>
						);
					}
					return (
						<TextInput
							key={`field-${key}`}
							value={fieldValue}
							label={label}
							title={label}
							onChange={onChange}
							placeholder={placeholder}
						/>
					);
				});
		}
		return [];
	}

	render() {
		const active = this.active();

		if (!active) {
			return <div />;
		}

		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		const { state } = this.props;
		const { spaceTheme = {} } = graph;
		const {
			themeColors = {},
			themeColorUses = {},
			themeOtherUses = {},
			themeGridPlacements = { grids: [] },
			themeFonts = { fonts: [] },
			themeVariables = { variables: [] }
		} = graph;

		const colors = Object.keys(ThemeColors)
			.map((color) => {
				if (themeColors) {
					return [
						<ColorInput
							value={themeColors[color]}
							immediate
							label={`${color} : ${themeColors[color]}`}
							key={`color-${color}`}
							onChange={(value: any) => {
								this.props.updateGraph('themeColors', { ...themeColors, [color]: value });
								const quickColor = [
									ThemeColors.primary,
									ThemeColors.secondary,
									ThemeColors.tertiary,
									ThemeColors.quanternary,
									ThemeColors.quinary
								]
									.map((v) => {
										if (!themeColors[v]) {
											return `000000`;
										}
										return themeColors[v].split('#').join('');
									})
									.join('-');
								this.setState({ quickColor });
							}}
							placeholder={color}
						/>
					];
				}
				return null;
			})
			.filter((x) => x);

		const colorUses = Object.keys(ColorUses)
			.map((use) => {
				if (themeColors) {
					return (
						<SelectInput
							key={`field-color-${use}`}
							value={themeColorUses ? themeColorUses[use] : null}
							label={use}
							title={use}
							color={themeColors && themeColorUses ? themeColors[themeColorUses[use]] : null}
							onChange={(value: any) => {
								this.props.updateGraph('themeColorUses', { ...themeColorUses, [use]: value });
							}}
							options={Object.keys(ThemeColors).map((d) => ({ title: d, value: d }))}
						/>
					);
				}
				return null;
			})
			.filter((x) => x);

		const otherUses = Object.keys(OtherUses)
			.map((use) => {
				if (themeOtherUses) {
					const variableNameParts = ['font', 'size'];
					if (!variableNameParts.some((v) => use.toLowerCase().indexOf(v) === -1)) {
						return (
							<Typeahead
								key={`field-font-family-${use}`}
								value={themeOtherUses ? themeOtherUses[use] : null}
								label={use}
								title={use}
								onChange={(value: any) => {
									this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
								}}
								options={themeVariables.variables
									.filter(
										(t: any) =>
											!variableNameParts.some((v) => t.variable.toLowerCase().indexOf(v) === -1)
									)
									.map((d: any) => ({
										title: d.variable,
										value: d.variable
									}))}
							/>
						);
					}
					if (use.indexOf('FontFamily') !== -1) {
						return (
							<SelectInput
								key={`field-font-family-${use}`}
								value={themeOtherUses ? themeOtherUses[use] : null}
								label={use}
								title={use}
								onChange={(value: any) => {
									this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
								}}
								options={themeFonts.fonts.map((d) => ({ title: d.fontCssVar, value: d.fontCssVar }))}
							/>
						);
					}
					return (
						<TextInput
							key={`field-color-${use}`}
							value={themeOtherUses ? themeOtherUses[use] : null}
							label={use}
							title={use}
							color={themeOtherUses ? themeOtherUses[use] : null}
							onChange={(value: any) => {
								this.props.updateGraph('themeOtherUses', { ...themeOtherUses, [use]: value });
							}}
						/>
					);
				}
				return null;
			})
			.filter((x) => x);
		const htmlElementGroup = this.state.sectionType
			? HTMLElementGroups.find((f) => f.name === this.state.sectionType)
			: null;
		let sectionTypeOptions: any = [];
		if (htmlElementGroup) {
			sectionTypeOptions = Object.keys(htmlElementGroup.type).map((v) => ({ title: v, value: v, id: v }));
		}
		return (
			<TopViewer active={active}>
				<section className="content">
					<div className="row">
						<div className="col-md-1">
							<Box maxheight={600} title={Titles.Style}>
								<FormControl>
									<button
										className="btn btn-default btn-flat"
										onClick={(evt: any) => {
											let models = NodesByType(this.props.state, NodeTypes.Model);
											let modelPropertyClasses: any = [];
											models.forEach((model: Node) => {
												let properties = GetNodesLinkedTo(GetCurrentGraph(), {
													id: model.id,
													componentType: NodeTypes.Property
												});
												properties.filter((v: Node) => !GetNodeProp(v, NodeProperties.IsDefaultProperty)).forEach((property: Node) => {
													modelPropertyClasses.push(`mp-${GetCssName(property)}.cls-${GetCssName(model)}`);
													modelPropertyClasses.push(`mp-${GetCssName(property)}`);
												})
											});
											this.setState({
												modelPropertyClasses
											});

											evt.stopPropagation();
											evt.preventDefault();
											return false;
										}}
									>
										Load Model Property Classes
									</button>
									<SelectInput
										options={Object.keys(MediaQueries).map((v) => ({ title: v, value: v, id: v }))}
										label={Titles.MediaSizes}
										onChange={(value) => {
											this.setState({ mediaSize: value });
										}}
										value={this.state.mediaSize}
									/>
									<CheckBox
										label={Titles.BindAll}
										onChange={(value) => {
											this.setState({ bindAll: value });
										}}
										value={this.state.bindAll}
									/>
									<TextInput
										value={this.state.quickColor}
										immediate
										label={Titles.QuickColor}
										onChange={(value: any) => {
											if (value) {
												const pcolors = value.split('-');
												if (pcolors && pcolors.length === 5) {
													if (
														!pcolors.some((v: any) =>
															v
																.split('')
																.some((y: any) => `0123456789abcdef`.indexOf(y) === -1)
														)
													) {
														const newTheme = { ...themeColors };
														[
															ThemeColors.primary,
															ThemeColors.secondary,
															ThemeColors.tertiary,
															ThemeColors.quanternary,
															ThemeColors.quinary
														].forEach((col, index) => {
															if (pcolors[index]) {
																newTheme[col] = `#${pcolors[index]}`;
															}
														});
														this.props.updateGraph('themeColors', newTheme);
													}
												}
											}
											this.setState({ quickColor: value });
										}}
										placeholder="######-######-######-######-######"
									/>
									{Object.keys(CssPseudoSelectors).sort().map((key) => (
										<CheckBox
											key={`check-box-${key}`}
											label={key}
											onChange={(value) => {
												this.setState({ [key]: value });
											}}
											value={this.state[key]}
										/>
									))}
									<button
										className="btn btn-default btn-flat"
										onClick={() => {
											const temp = {
												// 'themeColors': {},
												// 'themeColorUses': {},
												themeOtherUses: {}
												// 'themeFonts': { fonts: [] },
												// 'themeVariables': { variables: [] }
											};
											Object.keys(temp).map((v) => {
												this.props.updateGraph(v, temp[v]);
											});
										}}
									>
										Clear
									</button>
								</FormControl>
							</Box>
						</div>
						<div className="col-md-11">
							<TabContainer>
								<Tabs>
									<Tab
										active={VisualEq(state, THEME_VIEW_TAB, 'Variables')}
										title={'Variables'}
										onClick={() => {
											this.props.setVisual(THEME_VIEW_TAB, 'Variables');
										}}
									/>
									<Tab
										active={VisualEq(state, THEME_VIEW_TAB, 'Grid Placement')}
										title={'Grid Placement'}
										onClick={() => {
											this.props.setVisual(THEME_VIEW_TAB, 'Grid Placement');
										}}
									/>
									<Tab
										active={VisualEq(state, THEME_VIEW_TAB, 'Others')}
										title={'Others'}
										onClick={() => {
											this.props.setVisual(THEME_VIEW_TAB, 'Others');
										}}
									/>
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Variables')}>
									<ResponsiveGridLayout
										className="layout"
										draggableHandle={'.box-header'}
										layout={this.state.layout}
										onLayoutChange={(l: any) => {
											this.setState({ layout: l })
										}}
										measureBeforeMount={false}
										breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
										cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
									>
										<div key="a" data-grid={{ x: 0, y: 0, w: 6, h: 6 }}>
											<Panel stretch title={Titles.Fonts}>
												<FormControl>
													<TextInput
														value={this.state.fontName}
														label={`${Titles.Font} ${Titles.Name}`}
														title={`${Titles.Font} ${Titles.Name}`}
														immediate
														onChange={(value: any) => {
															this.setState({ fontName: value });
														}}
													/>

													<TextInput
														value={this.state.font}
														label={Titles.Font}
														title={Titles.Font}
														immediate
														onChange={(value: any) => {
															this.setState({ font: value });
														}}
													/>

													<div className="row">
														<div className="col-md-6">
															<TextInput
																value={this.state.fontCss}
																label={Titles.FontCss}
																title={Titles.FontCss}
																immediate
																onChange={(value: any) => {
																	this.setState({ fontCss: value });
																}}
															/>
														</div>
														<div className="col-md-6">
															<TextInput
																value={this.state.fontCssVar}
																label={Titles.FontCssVar}
																immediate
																title={Titles.FontCssVar}
																onChange={(value: any) => {
																	if (value && value.indexOf('--') === -1) {
																		value = `--${value}`;
																	}
																	this.setState({ fontCssVar: value });
																}}
															/>
														</div>
													</div>
													{this.state.font &&
														this.state.fontCss &&
														this.state.fontName &&
														this.state.fontCssVar ? (
															<button
																className="btn btn-primary"
																onClick={(event) => {
																	if (
																		this.state.font &&
																		this.state.fontCss &&
																		this.state.fontCssVar
																	) {
																		themeFonts.fonts = [
																			{
																				font: this.state.font,
																				fontCss: this.state.fontCss,
																				fontCssVar: this.state.fontCssVar,
																				fontName: this.state.fontName
																			},
																			...themeFonts.fonts
																		].unique((v) => v.font + v.fontName);
																		this.props.updateGraph('themeFonts', {
																			...themeFonts
																		});
																		this.setState({ font: '' });
																	}
																	event.stopPropagation();
																	event.preventDefault();
																	return false;
																}}
															>
																Ok
															</button>
														) : null}
													<ButtonList
														active
														items={themeFonts.fonts.map((v: any) => ({
															title: v.font,
															id: v.font,
															...v
														}))}
														renderItem={(item: any) => (
															<div
																className="col-md-12"
																style={{
																	display: 'flex',
																	alignItems: 'center'
																}}
															>
																<div className="col-md-10">
																	<h5 style={{ margin: 0 }}>{item.font}</h5>
																	<h5 style={{ margin: 0 }}>{item.fontCss}</h5>
																	<h6 style={{ margin: 0 }}>{item.fontCssVar}</h6>
																	<h6 style={{ margin: 0 }}>{item.fontName}</h6>
																</div>
																<div className="col-md-2">
																	<button
																		className="btn btn-default btn-flat"
																		onClick={(event) => {
																			themeFonts.fonts = themeFonts.fonts.filter(
																				(x) => x.font !== item.id
																			);
																			this.props.updateGraph('themeFonts', {
																				...themeFonts
																			});
																			event.stopPropagation();
																			event.preventDefault();
																		}}
																	>
																		<i className="fa fa-times" />
																	</button>
																</div>
															</div>
														)}
														onClick={(item) => {
															this.setState({
																...item
															});
														}}
													/>
												</FormControl>
											</Panel>
										</div>
										<div key="b" data-grid={{ x: 6, y: 0, w: 6, h: 6 }}>
											<Panel stretch title="Variables">
												<FormControl>
													<TextInput
														value={this.state.variable}
														label={Titles.Variable}
														title={Titles.Variable}
														immediate
														onChange={(value) => {
															if (value && value.indexOf('--') === -1) {
																value = `--${value}`;
															}
															this.setState({ variable: value });
														}}
													/>
													<TextInput
														value={this.state.variableValue}
														label={Titles.Value}
														title={Titles.Value}
														immediate
														onChange={(value) => {
															this.setState({ variableValue: value });
														}}
													/>
													{this.state.variable && this.state.variableValue ? (
														<button
															className={'btn btn-primary'}
															onClick={(event) => {
																event.stopPropagation();
																event.preventDefault();
																if (
																	this.state.variable &&
																	this.state.variableValue
																) {
																	themeVariables.variables = [
																		{
																			variable: this.state.variable,
																			variableValue: this.state.variableValue
																		},
																		...themeVariables.variables
																	].unique((v) => v.variable);
																	this.props.updateGraph('themeVariables', {
																		...themeVariables
																	});
																}
																return false;
															}}
														>
															Ok
														</button>
													) : null}
													<ButtonList
														active
														items={themeVariables.variables.map((v) => ({
															title: v.variable,
															id: v.variable,
															...v
														}))}
														renderItem={(item) => (
															<div
																className="col-md-12"
																style={{
																	display: 'flex',
																	alignItems: 'center'
																}}
															>
																<div className="col-md-10">
																	<h5 style={{ margin: 0 }}>{item.variable}</h5>
																	<h6 style={{ margin: 0 }}>
																		{item.variableValue}
																	</h6>
																</div>
																<div className="col-md-2">
																	<button
																		className="btn btn-default btn-flat"
																		onClick={(event) => {
																			themeVariables.variables = themeVariables.variables.filter(
																				(x) => x.variable !== item.id
																			);
																			this.props.updateGraph(
																				'themeVariables',
																				{ ...themeVariables }
																			);
																			event.stopPropagation();
																			event.preventDefault();
																		}}
																	>
																		<i className="fa fa-times" />
																	</button>
																</div>
															</div>
														)}
														onClick={() => { }}
													/>
												</FormControl>

											</Panel>
										</div>
									</ResponsiveGridLayout>
								</TabPane>
								<TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Grid Placement')}>
									<div className="row">
										<div className="col-md-3">
											<Box title={`${Titles.GridPlacement}`}>
												<TextInput
													value={this.state.gridGroup}
													label={`${Titles.GridPlacement} ${Titles.Name}`}
													immediate
													inputgroup
													title={`${Titles.GridPlacement} ${Titles.Name}`}
													onChange={(value) => {
														this.setState({ gridGroup: value });
													}}
													onClick={() => {
														let { gridGroup } = this.state;
														if (gridGroup && gridGroup.trim()) {
															gridGroup = gridGroup.trim();
															this.props.updateGraph('themeGridPlacements', {
																grids: [
																	{
																		id: GUID(),
																		name: gridGroup,
																		gridTemplateColumns: '',
																		gridTemplateRows: '',
																		gridPlacement: null
																	},
																	...themeGridPlacements.grids
																]
															});
														}
													}}
												/>
												<ButtonList
													active
													items={themeGridPlacements.grids.map((v) => ({
														title: v.name,
														...v
													}))}
													isSelected={(v) => v.id === this.state.currentGrid}
													renderItem={(item) => (
														<div
															className="col-md-12"
															style={{
																display: 'flex',
																alignItems: 'center'
															}}
														>
															<div className="col-md-10">
																<h4 style={{ margin: 0 }}>{item.name}</h4>
																<h5 style={{ margin: 0 }}>
																	{item.gridTemplateColumns}
																</h5>
																<h6 style={{ margin: 0 }}>{item.gridTemplateRows}</h6>
															</div>
															<div className="col-md-2">
																<button
																	className="btn btn-default btn-flat"
																	onClick={(event) => {
																		themeGridPlacements.grids = themeGridPlacements.grids.filter(
																			(x) => x.id !== item.id
																		);
																		this.props.updateGraph('themeGridPlacements', {
																			...themeGridPlacements,
																			grids: themeGridPlacements.grids
																		});
																		event.stopPropagation();
																		event.preventDefault();
																	}}
																>
																	<i className="fa fa-times" />
																</button>
															</div>
														</div>
													)}
													onClick={(item) => {
														this.setState({ currentGrid: item.id });
													}}
												/>
											</Box>
										</div>
										<div className="col-md-9">
											<Box title={Titles.GridPlacement}>
												<GridPlacementField
													squareHeight={100}
													gridSetup={themeGridPlacements.grids.find(
														(x) => x.id === this.state.currentGrid
													)}
													onChange={(setup: any) => {
														this.props.updateGraph('themeGridPlacements', {
															...themeGridPlacements,
															grids: [
																setup,
																...themeGridPlacements.grids.filter(
																	(x: any) => x.id !== setup.id
																)
															]
														});
													}}
													tags={[...Object.keys(ComponentTags), ...this.state.modelPropertyClasses.map((v: string) => {
														return v;
													})]}
												/>
											</Box>
										</div>
									</div>
								</TabPane>
								<TabPane active={VisualEq(state, THEME_VIEW_TAB, 'Others')}>
									<ResponsiveGridLayout
										className="layout"
										draggableHandle={'.box-header'}
										layout={this.state.otherLayout}
										onLayoutChange={(l: any) => {
											this.setState({ otherLayout: l })
										}}
										measureBeforeMount={false}
										breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
										cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
									>
										<div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 4 }}>
											<Panel stretch title={Titles.Fonts}>
												<FormControl>{colors}</FormControl>
											</Panel>
										</div>
										<div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 4 }}>
											<Panel stretch title={Titles.Fonts}>
												<FormControl>{colorUses}</FormControl>
											</Panel>
										</div>
										<div key="c" data-grid={{ x: 4, y: 0, w: 2, h: 4 }}>
											<Panel stretch title={Titles.Fonts}>
												<FormControl>{otherUses}</FormControl>
											</Panel>
										</div>
										<div key="d" data-grid={{ x: 6, y: 0, w: 3, h: 4 }}>
											<Box
												maxheight={500}
												title={Titles.SpaceTheme}
												onSearch={(search: string) => {
													this.setState({
														spaceSearch: search
													});
												}}
											>
												<FormControl>
													<Typeahead
														options={[...Object.keys(ComponentTags).map((v) => ({
															title: v,
															value: v,
															id: v
														})), ...(themeGridPlacements ? themeGridPlacements.grids || [] : []).map((v: any) => ({
															...v,
															title: v.name,
															value: v.name,
															id: v.name
														})), ...this.state.modelPropertyClasses.map((v: string) => {
															return {
																title: v,
																value: v,
																id: v
															}
														}), this.state.currentFieldValue ? {
															title: this.state.currentFieldValue,
															value: this.state.currentFieldValue
														} : null].filter(v => v)}
														onChangeText={(value: string) => {
															this.setState({
																currentFieldValue: value
															});
														}}
														label="Spaces"
														onChange={(value: string) => {
															this.setState({ componentTag: value });
														}}
														value={this.state.componentTag}
													/>

													{this.getSpaceFields(
														this.state.componentTag,
														this.state.mediaSize,
														spaceTheme,
														themeColors,
														themeVariables,
														(f: string) =>
															this.state.spaceSearch &&
															f.toLowerCase()
																.indexOf(this.state.spaceSearch.toLowerCase()) !== -1
													)}
													<div style={{ height: 300 }} />
												</FormControl>
											</Box>
										</div>
										<div key="e" data-grid={{ x: 0, y: 4, w: 2, h: 4 }} >
											<Box
												maxheight={500}
												title={this.state.sectionType || 'Search'}
												onSearch={(search: string) => {
													this.setState({
														[`search-${this.state.sectionType || 'search'}`]: search
													});
												}}
											>
												<FormControl>
													<SelectInput
														options={HTMLElementGroups.map((v) => ({
															title: v.name,
															value: v.name,
															id: v.name
														}))}
														label="Section Types"
														onChange={(value) => {
															this.setState({ sectionType: value });
														}}
														value={this.state.sectionType}
													/>
													{this.state.sectionType ? (
														<SelectInput
															options={sectionTypeOptions}
															label={this.state.sectionType}
															onChange={(value) => {
																this.setState({ [this.state.sectionType]: value });
															}}
															value={this.state[this.state.sectionType]}
														/>
													) : null}
													{this.getEditBoxes(
														this.state[this.state.sectionType],
														this.state.mediaSize,
														spaceTheme,
														themeColors,
														HTMLElementGroups.find(
															(f) => f.name === this.state.sectionType
														),
														themeVariables,
														(f) =>
															this.state[`search-${this.state.sectionType}`] &&
															f
																.toLowerCase()
																.indexOf(
																	`${this.state[
																		`search-${this.state.sectionType}`
																	]}`.toLowerCase()
																) !== -1
													)}
												</FormControl>
											</Box>
										</div>

										<div key="f" data-grid={{ x: 2, y: 4, w: 2, h: 4 }}  >
											<Panel stretch title={Titles.ColorUse}>
												<FormControl>
													<TextInput
														value={this.state.cssString}
														textarea
														onChangeText={(val: string) => {
															// this.setState({ cssString: val })
														}}
														onChanged={(val: string) => {
															this.setState({ cssString: val })
														}} />
													<button
														className="btn btn-default btn-flat"
														onClick={(e) => {
															let res: JSONNode = cssToJson(this.state.cssString);
															let colors = GetColors(this.state.cssString)
															this.setState({ cssJson: res, cssColors: colors });
															e.preventDefault();
															e.stopPropagation()
														}}
													>View</button>
												</FormControl>
											</Panel>
										</div>
										<div key="g" data-grid={{ x: 4, y: 4, w: 2, h: 4 }}  >
											<Box title={Titles.ColorUse}>
												<GenericPropertyContainer
													sideBarStyle={{ right: 0 }}
													active
													title="CSS"
													subTitle="afaf"
												>
													<TreeViewMenu active open={this.state.cssJsonOpen} toggle={() => {
														this.setState({
															cssJsonOpen: !this.state.cssJsonOpen
														});
													}} >
														{
															this.state.cssJson && this.state.cssJson.children && this.state.cssJson.children ? Object.entries(this.state.cssJson.children).map((item: any) => {
																let [key, children]: [string, Children] = item;
																let attributes: any = [];
																if (children.attributes) {
																	attributes = Object.entries(children.attributes).map((item: any) => {
																		return <ThemeStyleSection child={children} key={item[0]} title={item[0]} item={item[1]} />;
																	});
																}
																return <TreeViewMenu active key={key} title={key} description={key} open={this.state['asdff-' + key]} toggle={() => {
																	this.setState({
																		['asdff-' + key]: !this.state['asdff-' + key]
																	});
																}}>
																	<TreeViewItemContainer>
																		<TextInput label="target name" value={this.state[`target_name` + key] || key} onChangeText={(val: string) => {
																			this.setState({
																				[`target_name` + key]: val
																			});
																		}} />
																	</TreeViewItemContainer>
																	<TreeViewButtonGroup>
																		<TreeViewGroupButton
																			icon="fa fa-star"
																			onClick={() => {
																				let formTheme = spaceTheme;
																				let formType = this.state[`target_name` + key] || key;
																				formTheme[formType] = formTheme[formType] || {};
																				['@media only screen and (min-width: 1200px)', ...Object.keys(MediaQueries)].map((ms: string) => {
																					formTheme[formType][ms] = {};
																					Object.entries(children.attributes).forEach((item: any) => {
																						let key = item[0];
																						let value = item[1];
																						formTheme[formType][ms][key] = value;
																					})
																				});
																				this.setState({
																					turn: Date.now()
																				})
																				// spaceTheme,
																				// themeColors,
																				// themeVariables
																			}}
																		/>
																	</TreeViewButtonGroup>
																	{attributes}
																</TreeViewMenu>
															}) : []
														}
													</TreeViewMenu>
												</GenericPropertyContainer>
											</Box>
										</div>
										<div key="h" data-grid={{ x: 6, y: 4, w: 2, h: 4 }} >
											<Box title="CSS Colors">
												{(this.state.cssColors || [])
													.map((color: string) => {
														if (color) {
															return [
																<ColorInput
																	value={color}
																	immediate
																	label={`${color} : ${color}`}
																	key={`css-color-${color}`}
																	onChange={(value: any) => {
																	}}
																	placeholder={color}
																/>
															];
														}
														return null;
													})
													.filter((x: any) => x)}
											</Box>
										</div>
										<div key="i" data-grid={{ x: 9, y: 4, w: 3, h: 8 }} >
											<Panel stretch title={"CSS Selectors"} onSearch={(val: string) => {
												this.setState({ filterCssSelectors: val })
											}}>
												<GenericPropertyContainer
													sideBarStyle={{ right: 0 }}
													active
													title="Css Selectors"
													subTitle="Css Selectors"
												>
													<TreeViewMenu
														active
														open={this.state.cssSelectorPanel}
														toggle={() => {
															this.setState({
																cssSelectorPanel: !this.state.cssSelectorPanel
															});
														}}>
														<TreeViewItemContainer>
															<TextInput label="pattern swap" value={this.state.patternSwap || ''} onChange={(val: string) => {
																this.setState({ patternSwap: val });
															}} />
														</TreeViewItemContainer>
														<TreeViewButtonGroup>
															<TreeViewGroupButton icon={'far fa-copy'} onClick={() => {
																let keysToCopy = (spaceTheme ? Object.keys(spaceTheme) : []).filter((v: any) => {
																	if (this.state.filterCssSelectors) {
																		let temp = `${this.state.filterCssSelectors}`.toLowerCase();
																		return `${v}`.toLowerCase().indexOf(temp) !== -1;
							``										}
																	return true;
																});
																let { patternSwap, filterCssSelectors } = this.state;
																if (patternSwap && filterCssSelectors) {
																	keysToCopy.forEach((key: string) => {
																		let duplicate = JSON.parse(JSON.stringify(spaceTheme[key]));
																		let newKey = key.replace(filterCssSelectors, patternSwap)
																		spaceTheme[newKey] = duplicate;
																	});
																	this.setState({ turn: Date.now() })
																}
															}} />
														</TreeViewButtonGroup>
														<TreeViewMenu active title={'CSS Selectors'} open={this.state.cssSelectors} toggle={() => {
															this.setState({
																cssSelectors: !this.state.cssSelectors
															});
														}}>
															{(spaceTheme ? Object.keys(spaceTheme) : []).filter((v: any) => {
																if (this.state.filterCssSelectors) {
																	let temp = `${this.state.filterCssSelectors}`.toLowerCase();
																	return `${v}`.toLowerCase().indexOf(temp) !== -1;
																}
																return true;
															}).map((v: any) => {
																return (<TreeViewMenu title={v} active open={this.state[`selecto-${v}`]} onClick={() => {
																	this.setState({
																		[`selecto-${v}`]: !this.state[`selecto-${v}`]
																	})
																}}>
																	<TreeViewMenu description={'select'} title={'select'} onClick={() => {
																		this.setState({ componentTag: v });
																	}} />
																	<TreeViewMenu description={'delete'} title={'delete'} onClick={() => {
																		delete spaceTheme[v];
																		this.setState({ turn: Date.now() })
																	}} />
																</TreeViewMenu>);
															})}
														</TreeViewMenu>
													</TreeViewMenu>
												</GenericPropertyContainer>
											</Panel>
										</div>
									</ResponsiveGridLayout>
								</TabPane>
							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer >
		);
	}
}

export default UIConnect(ThemeView);
