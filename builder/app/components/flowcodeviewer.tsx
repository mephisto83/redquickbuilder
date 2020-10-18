// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import TreeViewMenu from './treeviewmenu';
import { EnumerationConfig } from '../interface/methodprops';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';
import { UIConnect } from '../utils/utils';
import DashboardContainer from './dashboardcontainer';
import Panel from './panel';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Visual } from '../actions/uiactions';
import { QuickAccess, GraphLink } from '../methods/graph_types';
import path from 'path';
import FlowCode, { callAutoDistribute } from './flowcode';
import { DeclartionColors, IFlowCodeConfig, IFlowCodeStatements, LoadFileSource } from '../constants/flowcode_ast';

class FlowCodeViewer extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	minified() {
		const { state } = this.props;
		return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
	}

	render() {
		let props: any = this.props;
		const { state } = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		const Deflayout = [
			{ i: 'a', x: 0, y: 0, w: 6, h: 6 }
		];
		let currentViewNode: string | null = Visual(state, UIA.CURRENT_VIEW_NODE);
		let node: Node = UIA.GetNodeForView(state, currentViewNode);

		return (
			<DashboardContainer flex minified={UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU)} sideBar={this.getSideBar()}>
				<Panel stretch title={node ? UIA.GetNodeTitle(node) : 'Current Node'}>
					<FlowCode fileSource={this.state.fileSource} code={this.state.code} functionName={this.state.functionName} />
				</Panel>
			</DashboardContainer>
		);
	}
	getSideBar() {
		let flows = Visual(this.props.state, UIA.FLOW_CODE_FLOWS);
		console.log(flows);
		let typescriptFlows: any[] = [];
		if (flows) {
			Object.entries(flows).map((item: [string, any], index: number) => {
				let [key, flow] = item;
				typescriptFlows.push(<TreeViewMenu
					active
					title={key}
					key={`${key}-${index}`}
					icon="fa fa-map"
					onClick={() => {
						// SetFlowCodeModel(flow, key);
						this.setState({ functionName: key, code: flow });
					}}
				/>)
			})
		}
		return [
			<TreeViewMenu key="loadbutton" title="load" onClick={() => {
				LoadFileSource().then((fileSource) => {
					let treeStruct: any = this.state.treeStruct || {};
					if (this.state.fileSource) {
						fileSource = { ...this.state.fileSource, ...fileSource }
					}
					Object.entries(fileSource).map((item: any[]) => {
						let [key, obj] = item;
						let statements: IFlowCodeStatements = obj;
						let splitpath = key.split(path.sep);
						let view = treeStruct;
						splitpath.forEach((d: string, index: number) => {
							view[d] = view[d] || {}
							if (splitpath.length - 1 === index) {
								view[d][` statements `] = statements;
								view[d][` file `] = key;
							}
							view = view[d];
						});
					});
					this.setState({ treeStruct: treeStruct, fileSource })
				})
			}} />,
			<TreeViewMenu key="redraw" title="Redraw" onClick={() => {
				callAutoDistribute();
			}} />,
			<TreeViewMenu
				key="typescriptflows"
				title="Typescript"
				active
				open={this.state.typescriptFlowMenu}
				onClick={() => {
					this.setState({ typescriptFlowMenu: !this.state.typescriptFlowMenu })
				}}>

				{typescriptFlows}
				{this.getTypescriptAsts()}
			</TreeViewMenu>];
	}
	getTypescriptAsts() {
		let result: any[] = [];

		if (this.state.fileSource) {
			let treeStruct: any = {};

			Object.entries(this.state.fileSource).map((item: any[]) => {
				let [key, obj] = item;
				let statements: IFlowCodeStatements = obj;
				let splitpath = key.split(path.sep);
				let view = treeStruct;
				splitpath.forEach((d: string, index: number) => {
					view[d] = view[d] || {}
					if (splitpath.length - 1 === index) {
						view[d][` statements `] = statements;
						view[d][` file `] = key;
					}
					view = view[d];
				});
			});
			let buildTree = (root: any, prevPath: any, title?: string) => {
				if (root[` statements `]) {
					return <TreeViewMenu active
						title={title || 'root'}
						open={this.state[`${prevPath}-${title}`]} onClick={() => {
							this.setState({
								[`${prevPath}-${title}`]: !this.state[`${prevPath}-${title}`]
							})
						}} >
						{this.getTypescriptASTFunctions(root[` statements `], root[` file `])}
					</TreeViewMenu>
				}
				else {
					return (<TreeViewMenu active title={title || 'root'}
						open={this.state[`${prevPath}-${title}`]}
						onClick={() => {
							this.setState({
								[`${prevPath}-${title}`]: !this.state[`${prevPath}-${title}`]
							})
						}}>{Object.entries(root).map((item: [string, any]) => {
							let [ket, subtree] = item;
							return buildTree(subtree, `${prevPath}-${title}`, ket);
						})}</TreeViewMenu>)
				}
			}
			return buildTree(treeStruct, '');
		}

		return result;
	}
	getTypescriptASTFunctions(statements: IFlowCodeStatements, file: string): any {
		let result: any[] = [];

		Object.entries(statements).map((value: [string, IFlowCodeConfig]) => {
			let [key, config] = value;
			let colorKey: any = config.ast ? config.ast.kind : '';
			result.push(<TreeViewMenu active title={key} key={key} iconcolor={DeclartionColors[colorKey] || config.color} onDragStart={(event: any) => {
				event.dataTransfer.setData('storm-diagram-node', JSON.stringify({
					type: key,
					file: file,
					color: DeclartionColors[colorKey] || config.color
				}));
			}} />)
		})

		return result;
	}
}

export default UIConnect(FlowCodeViewer);
