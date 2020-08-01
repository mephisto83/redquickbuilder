import { MethodDescription } from '../../interface/methodprops';
import { FunctionMethodTypes, MethodFunctions } from '../../constants/functiontypes';
import { CreateNewNode, graphOperation, GetDispatchFunc, GetStateFunc } from '../../actions/uiactions';
import { NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to: MethodDescription;
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let { from, to } = args;
	let from_parameter_template = `
        Function<Task> func = async ({{agent_type}} agent, {{from_model}} fromModel, {{from_model}}ChangeBy{{agent_type}} change) => {

        var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, value, FunctionName.{{default_executor_function_name}});
        var result = await StreamProcess.{{model}}_{{agent_type}}(parameters, false);
       };

       await func(agent, fromModel, change);
  `;

	if (to && to.functionType) {
		if (from && from.functionType) {
			let methodFunction = MethodFunctions[from.functionType];
			if (methodFunction) {
				graphOperation(
					CreateNewNode(
						{
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.CS]: true,
							[NodeProperties.CSEntryPoint]: true,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
							[NodeProperties.Lambda]: from_parameter_template
						},
						(res: Node) => {
							if (res && callback) callback(res);
						}
					)
				)(GetDispatchFunc(), GetStateFunc());
			}
		}
	}
}
