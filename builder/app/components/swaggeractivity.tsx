// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import SelectInputProperty from './selectinputproperty';
import CheckBox from './checkbox';
import SelectLambdaInsertProperty from './selectlambdainsertproperty';
import {
	NodeProperties,
	NodeTypes,
	LinkType,
	SelectorPropertyKeys,
	NavigateTypes,
	CODE_EDITOR,
	MAIN_CONTENT,
	LinkProperties,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages
} from '../constants/nodetypes';
import { GetNodesLinkedTo, NodesByType, GetNodeProp, GetNodeLinkedTo } from '../methods/graph_methods';
import { MethodFunctions } from '../constants/functiontypes';
import { DataChainFunctions, DataChainContextMethods } from '../constants/datachain';
import ButtonList from './buttonlist';

import { getReferenceInserts } from '../utils/utilservice';
import CheckBoxProperty from './checkboxproperty';
import Typeahead from './typeahead';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { GetJSONReferenceInserts, ReferenceInsert, ReferenceInsertType } from './lambda/BuildLambda';
import { SwaggerProcessData } from '../service/swagger';

class SwaggerActivity extends Component<any, any> {
	render() {
		const { state } = this.props;
		const active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Swagger);
		if (!active) {
			return <div />;
		}
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const dataChainFuncType = UIA.GetNodeProp(currentNode, NodeProperties.DataChainFunctionType);
		const showModel = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.model
			: false;
		const lambda = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.lambda : false;
		let inserts = [];

		return (
			<TabPane active={active}>
				<FormControl>
					<TextInput
						onChange={(value: any) => {
							const id = currentNode.id;
							this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
								prop: UIA.NodeProperties.SwaggerEndpoint,
								id,
								value
							});
						}}
						label={Titles.Number}
						value={UIA.GetNodeProp(currentNode, NodeProperties.SwaggerEndpoint)}
					/>
					<TreeViewButtonGroup>
						<TreeViewGroupButton
							title={Titles.Load}
							onClick={() => {
								fetch(GetNodeProp(currentNode.id, NodeProperties.SwaggerEndpoint))
									.then((response) => response.json())
									.then((data: any) => {
										console.log(data);
										SwaggerProcessData(currentNode.id, data);
									});
							}}
							icon="fa  fa-cloud-download"
						/>
					</TreeViewButtonGroup>
				</FormControl>
			</TabPane>
		);
	}
}

export default UIConnect(SwaggerActivity);
