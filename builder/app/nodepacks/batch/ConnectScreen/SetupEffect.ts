import { Node, Graph } from '../../../methods/graph_types';
import { Effect, EffectProps, EffectDescription } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import {
	GetNodesLinkedTo,
	GetNodeProp,
	getLinkInstance,
	GetCellCount,
	SetCellsLayout,
	GetLastCell
} from '../../../methods/graph_methods';
import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeTitle,
	GetNodeById,
	NodeTypes,
	GetNodeByProperties,
	UPDATE_LINK_PROPERTY,
	updateComponentProperty
} from '../../../actions/uiactions';
import { LinkType, NodeProperties, LinkPropertyKeys } from '../../../constants/nodetypes';
import AddButtonToComponent from '../../AddButtonToComponent';
import GetModelObjectFromSelector from '../../GetModelObjectFromSelector';
import ConnectLifecycleMethod from '../../../components/ConnectLifecycleMethod';
import { InstanceTypes } from '../../../constants/componenttypes';
import AppendPostMethod from '../../screens/AppendPostMethod';
import AppendValidations from '../../screens/AppendValidations';
import { AddButtonToSubComponent, AddButtonToComponentLayout, AddApiToButton, AddComponentAutoStyles } from './Shared';
import NColumnSection from '../../NColumnSection';
import CreateHideComponentStyle from '../../screens/CreateHideComponentStyle';

export default function SetupEffect(screen: Node, effect: Effect, information: SetupInformation) {
	console.log('setup effect');

	effect.effects.forEach((effectDescription: EffectDescription) => {
		SetupEffectDescription(effectDescription, screen, information);
	});
}
function SetupEffectDescription(effectDescription: EffectDescription, screen: Node, information: SetupInformation) {
	console.log('setup effect description');
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	setup_options.forEach((screenOption: Node) => {
		graph = GetCurrentGraph();
		console.log('add button to sub component');
		let { eventInstance, event, button, subcomponent } = AddButtonToSubComponent(screenOption);
		AddApiToButton({ button, component: subcomponent });
		updateComponentProperty(button, NodeProperties.UIText, effectDescription.name || GetNodeTitle(button));

		console.log('get model selector node');
		let { modelSelectorNode } = GetModelSelectorNode(screen);

		console.log('setup model object selector');
		let { modelDataChain } = SetupModelObjectSelector(effectDescription, screenOption, screen, information);

		console.log('effectDescription');
		console.log(effectDescription);
		if (eventInstance && effectDescription.methodDescription && effectDescription.methodDescription.methodId) {
			console.log('connect lifecylce method');
			graph = GetCurrentGraph();
			let connectSteps = ConnectLifecycleMethod({
				target: effectDescription.methodDescription.methodId,
				selectorNode: () => modelSelectorNode.id,
				dataChain: () => (modelDataChain ? modelDataChain.id : null),
				source: eventInstance,
				graph
			});

			graphOperation(connectSteps)(GetDispatchFunc(), GetStateFunc());
			console.log('update component property');
			updateComponentProperty(
				button,
				NodeProperties.ValidationMethodTarget,
				effectDescription.methodDescription.methodId
			);
			let instanceType = GetNodeProp(screen, NodeProperties.InstanceType);
			if (instanceType === InstanceTypes.ScreenInstance) {
				SetInstanceUpdateOnLlink({
					eventInstance,
					eventHandler: event
				});
				SetupPostMethod({
					eventInstance,
					method: effectDescription.methodDescription.methodId
				});
				SetupValidations({ screenOption, effectDescription });
			}
		}
		let cellId = AddButtonToComponentLayout({ button, component: subcomponent });
		AddComponentAutoStyles(subcomponent, effectDescription, cellId);
  });

}
function SetupValidations(args: { screenOption: Node; effectDescription: EffectDescription }) {
	console.log('setup validations');
	let { screenOption, effectDescription } = args;
	let graph = GetCurrentGraph();
	const components = GetNodesLinkedTo(graph, {
		id: screenOption.id,
		link: LinkType.Component
	});

	components.forEach((component: Node) => {
		const subcomponents = GetNodesLinkedTo(graph, {
			id: component.id,
			link: LinkType.Component
		});

		graphOperation(
			AppendValidations({
				subcomponents,
				component,
				InstanceUpdate: true,
				screen_option: screenOption,
				method: effectDescription.methodDescription ? effectDescription.methodDescription.methodId : null
			})
		)(GetDispatchFunc(), GetStateFunc());
	});
}

function SetupPostMethod(args: { eventInstance: string; method: string }) {
	let { method, eventInstance } = args;
	console.log('setup post method');

	graphOperation(
		AppendPostMethod({
			method,
			handler: () => eventInstance
		})
	)(GetDispatchFunc(), GetStateFunc());
}
function SetInstanceUpdateOnLlink(args: { eventInstance: string; eventHandler: string }) {
	let { eventInstance, eventHandler } = args;
	console.log('set instance update on link');

	graphOperation([
		{
			operation: UPDATE_LINK_PROPERTY,
			options(currentGraph: any) {
				const link = getLinkInstance(currentGraph, {
					target: eventInstance,
					source: eventHandler
				});
				if (link)
					return {
						id: link.id,
						prop: LinkPropertyKeys.InstanceUpdate,
						value: true
					};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
}
function GetModelSelectorNode(screen: Node): { modelSelectorNode: Node } {
	const modelSelectorNode = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.Selector,
		[NodeProperties.Model]: GetNodeProp(screen, NodeProperties.Model)
	});

	return { modelSelectorNode };
}
function SetupModelObjectSelector(
	effectDescription: EffectDescription,
	screenOption: Node,
	screen: Node,
	information: SetupInformation
): { modelDataChain: Node | null } {
	let modelDataChain: Node | null = null;
	graphOperation(
		GetModelObjectFromSelector({
			model: GetNodeTitle(screen),
			callback: (newContext: { entry: string }, tempGraph: Graph) => {
				modelDataChain = GetNodeById(newContext.entry, tempGraph);
			}
		})
	)(GetDispatchFunc(), GetStateFunc());
	return { modelDataChain };
}

export function GetEffect(effectProps: EffectProps, viewType: string): Effect | null {
	let temp: any = effectProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
}
