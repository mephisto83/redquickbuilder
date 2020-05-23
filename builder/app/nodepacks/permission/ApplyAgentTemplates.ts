import { GetNodesLinkedTo, GetNodeLinkedTo } from '../../methods/graph_methods';
import { LinkType } from '../../constants/nodetypes';
import {
	NodeTypes,
	GetCurrentGraph,
	NodesByType,
	GetPermissionMethod,
	GetMethodFunctionType,
	GetMethodNodeProp
} from '../../actions/uiactions';
import { Node } from '../../methods/graph_types';
import { FunctionTemplateKeys } from '../../constants/functiontypes';
import ApplyPermissionTemplate from './ApplyPermissionTemplate';

export default function ApplyAgentTemplates(args: { agentId: string; modelId: string }) {
	let graph = GetCurrentGraph();
	let { agentId, modelId } = args;
	let agentPermissionTemplates = GetNodesLinkedTo(graph, {
		id: args.agentId,
		link: LinkType.AgentLink,
		componentType: NodeTypes.PermissionTemplate
	}).filter((x: any) => {
		let agent = GetNodeLinkedTo(graph, {
			id: x.id,
			link: LinkType.AgentLink
		});
		let model = GetNodeLinkedTo(graph, {
			id: x.id,
			link: LinkType.ModelTypeLink
		});

		return agent && agent.id === agentId && model && model.id === modelId;
	});
	let agentPermission: Node | null = null;
	if (agentPermissionTemplates && agentPermissionTemplates.length === 1) {
		agentPermission = agentPermissionTemplates[0];
	} else {
		return [];
	}

	let permissionNodes = NodesByType(null, NodeTypes.Permission).filter((permissionNode: Node) => {
		let method = GetPermissionMethod(permissionNode);
		let model =
			GetMethodNodeProp(method, FunctionTemplateKeys.ModelOutput) ||
			GetMethodNodeProp(method, FunctionTemplateKeys.Model);
		let agent = GetMethodNodeProp(method, FunctionTemplateKeys.Agent);

		return model === modelId && agent === agentId;
	});

	let result: any = [];

	permissionNodes.forEach((node: Node) => {
		if (!agentPermission) {
			throw new Error('missing agent permission id');
		}
		result.push(
			...ApplyPermissionTemplate({
				agentPermissionId: agentPermission ? agentPermission.id : '',
				permissionNodeId: node.id
			})
		);
	});

	return result;
}
