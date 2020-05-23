import { GetCurrentGraph, GetLinkProperty, GetPermissionMethod, GetMethodFunctionType } from '../../actions/uiactions';
import {
	LinkType,
	NodeProperties,
	ConditionTypes,
	ValidationRules,
	LinkPropertyKeys,
	FilterUI
} from '../../constants/nodetypes';
import { GetNodesLinkedTo, GetNodeProp, GetNodeLinkedTo, GetLinkBetween } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import AddPermissionCondition, { PermissionItem } from './AddPermissionCondition';

export default function ApplyPermissionTemplate(args: {
	agentPermissionId: string;
	permissionNodeId: string;
	viewPackages?: any;
}): any[] {
	let graph = GetCurrentGraph();
	// let method = GetPermissionMethod({ id: args.permissionNodeId });
	let functionType: string = GetMethodFunctionType(args.permissionNodeId);
	let properties: PermissionItem[] = [];
	let conditionTemplates: Node[] = GetNodesLinkedTo(graph, {
		id: args.agentPermissionId,
		link: LinkType.ConditionTemplate
	});

	conditionTemplates.forEach((conditionTemplate: Node) => {
		switch (GetNodeProp(conditionTemplate, NodeProperties.Condition)) {
			case ConditionTypes.Enumeration:
				let agent = GetNodeLinkedTo(graph, {
					id: conditionTemplate.id,
					link: LinkType.AgentLink
				});
				let property = GetNodeLinkedTo(graph, {
					id: conditionTemplate.id,
					link: LinkType.PropertyLink
				});
				let enumeration = GetNodeLinkedTo(graph, {
					id: conditionTemplate.id,
					link: LinkType.Enumeration
				});
				let link = GetLinkBetween(conditionTemplate.id, enumeration.id, graph);
				let enumerations = GetLinkProperty(link, LinkPropertyKeys.Enumeration);
				let enums: { [str: string]: boolean } = {};
				if (enumerations) {
					enumerations.forEach((e: string) => {
						enums[e] = true;
					});
				}


				properties.push({
					property: property.id,
					validators: [
						{
							...FilterUI[ValidationRules.OneOf],
							node: enumeration.id,
							enumeration: enums
						}
					]
				});
				break;
		}
	});

	return AddPermissionCondition({
		permissionNode: args.permissionNodeId,
		functionType,
		viewPackages: args.viewPackages,
		properties
	});
}
