import UpdateModelAndGoBack from '../UpdateModelAndGoBack';
import { GetMethodNodeProp, GetNodeById, ADD_LINK_BETWEEN_NODES } from '../../actions/uiactions';
import { FunctionTemplateKeys } from '../../constants/functiontypes';
import { LinkProperties } from '../../constants/nodetypes';

export default function AppendPostMethod(args: any = {}) {
	if (!args.method) {
		throw 'missing method for appending a post method';
	}
	if (!args.handler) {
		throw 'missing handler';
	}
	let { viewPackages } = args;
	let model =
		GetMethodNodeProp(GetNodeById(args.method), FunctionTemplateKeys.Model) ||
		GetMethodNodeProp(GetNodeById(args.method), FunctionTemplateKeys.ModelOutput);
	let dataChain: any = null;
	return [
		...UpdateModelAndGoBack({
			viewPackages,
			model: model,
			callback: (updateContext: any) => {
				dataChain = updateContext.entry;
			}
		}),
		function() {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options: function() {
					return {
						source: args.handler(),
						target: dataChain,
						properties: { ...LinkProperties.DataChainLink }
					};
				}
			};
		}
	];
}
