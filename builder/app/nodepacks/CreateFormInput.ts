import { uuidv4 } from '../utils/array';
import { NodeProperties } from '../constants/nodetypes';
import {
	GetModelPropertyChildren,
	GetNodeProp,
	NEW_COMPONENT_NODE,
	LinkProperties,
	GetNodeTitle
} from '../actions/uiactions';
import { InstanceTypes } from '../constants/componenttypes';
import { ViewTypes } from '../constants/viewtypes';
function createForm(
	args: any = {
		modelProperty: null,
		parent: null,
		uiType: null,
		sharedComponent: false,
		viewType: false
	}
) {
	//
	if (args.parent) {
		if (!args.uiType) {
			args.uiType = GetNodeProp(args.parent, NodeProperties.UIType);
		}
	}

	//
	if (!args.modelProperty) {
		throw 'missing a modelProperty';
	}
	if (!args.viewType) {
		throw 'missing a viewType';
	}

	if (!args.parent) {
		throw 'missing a parent';
	}

	if (!args.uiType) {
		throw 'missing uiType';
	}

	let context = {
		...args
	};
	let result = [];
	let { parent, modelProperty, sharedComponent, viewComponentType, viewType, uiType } = context;

	let useModelInstance = [ ViewTypes.Get, ViewTypes.GetAll, ViewTypes.Delete ].some((v) => viewType === v);

	let { viewPackages } = args;

	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	result.push({
		operation: NEW_COMPONENT_NODE,
		options: function() {
			// Check if the property has a default view to use for different types of situations

			return {
				parent,
				groupProperties: {},
				properties: {
					...viewPackages,
					[NodeProperties.UIText]: `${GetNodeTitle(modelProperty)}`,
					[NodeProperties.UIType]: uiType,
					[NodeProperties.Label]: GetNodeTitle(modelProperty),
					[NodeProperties.ComponentType]: sharedComponent || viewComponentType,
					[NodeProperties.UsingSharedComponent]: !!sharedComponent,
					[NodeProperties.Pinned]: false,
					[NodeProperties.InstanceType]: useModelInstance
						? InstanceTypes.ModelInstance
						: InstanceTypes.ScreenInstance
				},
				linkProperties: {
					properties: { ...LinkProperties.ComponentLink }
				},
				callback: (component: any) => {
					if (args.callback) {
						args.callback(component);
					}
				}
			};
		}
	});

	return result;
}
createForm.description = 'Create a form based on a modelProperty';

export default createForm;
