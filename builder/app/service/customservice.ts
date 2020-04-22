import {
	GetServiceInterfaceMethodCalls,
	GetCodeName,
	GetCurrentGraph,
	GetNodeProp,
	GetMethodNode,
	GetState,
	GetMethodParametersFor
} from '../actions/uiactions';
import { bindTemplate } from '../constants/functiontypes';
import { NEW_LINE, NodeTypes, NodeProperties } from '../constants/nodetypes';
import { addNewLine } from '../utils/array';
import { GetNodesLinkedTo } from '../methods/graph_methods';
import { connect } from 'net';
import { GetPermissionMethodParametersImplementation } from './permissionservice';
import { GetValidationMethodParametersImplementation } from './validationservice';
import ExecutorGenerator from '../generators/executiongenerator';
let interface_template = `
    public interface I{{class}} {
{{methods}}
    }
`;
export function GenerateServiceInterface(serviceInterface: any, language?: any) {
	let methodCalls = GetServiceInterfaceMethodCalls(serviceInterface ? serviceInterface.id : null);
	let methods: any = [];
	let graph = GetCurrentGraph(GetState());
	methodCalls.map((mc: any) => {
		let connectedNodes = GetNodesLinkedTo(graph, {
			id: mc.id
		}).filter((x: any) =>
			[ NodeTypes.Permission, NodeTypes.Validator, NodeTypes.Executor ].some(
				(t) => t === GetNodeProp(x, NodeProperties.NODEType)
			)
		);
		if (connectedNodes && connectedNodes.length) {
			connectedNodes.map((cn: any) => {
				let parameters = '';
				let output = '';
				switch (GetNodeProp(cn, NodeProperties.NODEType)) {
					case NodeTypes.Permission:
						parameters = GetPermissionMethodParametersImplementation(cn.id, language);
						output = 'bool';
						break;
					case NodeTypes.Validator:
						parameters = GetValidationMethodParametersImplementation(cn.id, language);
						output = 'bool';
						break;
					case NodeTypes.Executor:
						parameters = ExecutorGenerator.GetParameters(cn);
						output = GetCodeName(ExecutorGenerator.GetOutput(cn));
						break;
				}

				methods.push(
					bindTemplate(`Task<{{output}}> ${GetCodeName(mc)}({{parameters}});`, {
						parameters,
						output
					})
				);
			});
		}
	});

	return bindTemplate(interface_template, {
		class: GetCodeName(serviceInterface),
		methods: addNewLine(methods.unique().join(NEW_LINE))
	});
}
