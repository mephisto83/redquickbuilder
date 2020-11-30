import { NodeProperties, Methods, LinkPropertyKeys, UITypes, NodeTypes } from '../../constants/nodetypes';
import { uuidv4 } from '../../utils/array';
import { GetNodeProp, UPDATE_NODE_PROPERTY, UPDATE_LINK_PROPERTY } from '../../actions/uiActions';
import SetupViewTypeForCreate, { GetViewTypeModelType } from './SetupViewTypeForCreate';
import SetupViewTypeForGetAll from './SetupViewTypeForGetAll';
import AttachGetAllOnComponentDidMount from './AttachGetAllOnComponentDidMount';
import { setViewPackageStamp, GetLinkBetween, GetNodesLinkedTo } from '../../methods/graph_methods';
import RemoveAllViewPackage from '../RemoveAllViewPackage';
import AppendViewTypeValidation from './AppendViewTypeValidation';

export default function SetupViewTypeFor(args: any = {}) {
	const { skipClear = false, node, uiType = UITypes.ElectronIO } = args;
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	const component = GetNodesLinkedTo(null, {
		id: node,
		componentType: NodeTypes.ComponentNode
	}).find((v: any) => GetNodeProp(v, NodeProperties.UIType) === uiType);
	if (!component) {
		console.warn('no component found for ' + uiType);
		return [];
	}
	const context = { uiType, viewPackages, ...args };
	const result = [];
	const lastViewPackage = GetNodeProp(node, NodeProperties.LastViewPackage);
	if (lastViewPackage && !skipClear) {
		result.push(...RemoveAllViewPackage({ view: lastViewPackage }));
	}
	setViewPackageStamp(viewPackages, 'setup-view-type-for');
	const viewType = GetNodeProp(node, NodeProperties.ViewType);
	let createUpdateContext: any = null;

	switch (viewType) {
		case Methods.Update:
		case Methods.Create:
			result.push(
				...SetupViewTypeForCreate({
					...context,
					callback: (setviewContext: any) => {
						createUpdateContext = setviewContext;
					}
				})
			);
			if (viewType === Methods.Update) {
				result.push((ggraph: any) => {
					const { eventTypeInstanceNode, eventTypeNode } = createUpdateContext;
					const link = GetLinkBetween(eventTypeNode, eventTypeInstanceNode, ggraph);
					if (link) {
						return {
							operation: UPDATE_LINK_PROPERTY,
							options: {
								prop: LinkPropertyKeys.InstanceUpdate,
								value: true,
								id: link.id
							}
						};
					}
				});
			}
			break;
		case Methods.Get:
		case Methods.GetAll:
			result.push(...SetupViewTypeForGetAll(context));
			break;
		default:
			throw new Error('no view type set');
	}

	result.push(...AttachGetAllOnComponentDidMount(context));
	result.push({
		operation: UPDATE_NODE_PROPERTY,
		options: {
			id: node,
			properties: {
				[NodeProperties.LastViewPackage]: viewPackages[NodeProperties.ViewPackage]
			}
		}
	});

	const { model, property } = GetViewTypeModelType(node);
	result.push(...AppendViewTypeValidation({ model, property, method: args.validationMethod, ...args }));
	result.push(() => {
		setViewPackageStamp(null, 'setup-view-type-for');
		return [];
	});
	return result;
}
