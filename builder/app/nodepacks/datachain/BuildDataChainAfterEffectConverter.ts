import { MethodDescription } from '../../interface/methodprops';
import { FunctionMethodTypes, MethodFunctions, bindTemplate } from '../../constants/functiontypes';
import {
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetCodeName,
	updateComponentProperty
} from '../../actions/uiactions';
import { NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';
import { updateNodeProperty, codeTypeWord } from '../../methods/graph_methods';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to: MethodDescription;
	dataChain?: string;
	afterEffectParent: string;
	afterEffectChild: string;
	name: string;
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let { from, to, dataChain, afterEffectParent, afterEffectChild, name } = args;
	let from_parameter_template = `
        Function<Task> func = async ({{agent_type}} agent, {{from_model}} fromModel, {{from_model}}ChangeBy{{agent_type}} change) => {
          var value = {{model}}.Create();
          // build model value here.

          var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, value, FunctionName.{{default_executor_function_name}});
          {{model}}ChangeBy{{agent_type}}.UpdatePath(parameters, change, AfterEffectChains.{{after_effect_parent}}.{{after_effect_child}});
          await StreamProcess.{{model}}_{{agent_type}}(parameters, false);
       };

       await func(agent, fromModel, change);
  `;

	from_parameter_template = bindTemplate(from_parameter_template, {
		from_model: `${GetCodeName(from.properties.model_output || from.properties.model || from.properties.agent)}`,
		agent_type: `${GetCodeName(from.properties.agent || from.properties.model_output || from.properties.model)}`,
		model: `${GetCodeName(to.properties.model || to.properties.agent)}`,
		after_effect_parent: codeTypeWord(afterEffectParent),
		after_effect_child: codeTypeWord(afterEffectChild)
	});
	if (to && to.functionType) {
		if (from && from.functionType) {
			let methodFunction = MethodFunctions[from.functionType];
			if (dataChain) {
				updateComponentProperty(dataChain, NodeProperties.Lambda, from_parameter_template);
				updateComponentProperty(dataChain, NodeProperties.UIText, name);
			} else if (methodFunction) {
				graphOperation(
					CreateNewNode(
						{
							[NodeProperties.UIText]: name,
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
