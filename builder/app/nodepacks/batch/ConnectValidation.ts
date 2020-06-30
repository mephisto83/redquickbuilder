import { LinkType, NodeProperties } from '../../constants/nodetypes';
import { GetNodesLinkedTo, GetNodeProp } from '../../methods/graph_methods';
import { GetCurrentGraph, GetNodeById } from '../../actions/uiactions';
import { ComponentEvents } from '../../constants/componenttypes';
import AppendValidations from '../screens/AppendValidations';
import { uuidv4 } from '../../utils/array';

export default function ConnectValidations(args: {
	screen: string;
	screenOption: string;
	viewPackages?: any;
	methods: string[];
}) {
	let { screen, methods } = args;
	if (!screen) {
		throw 'no node';
	}
	if (!methods) {
		throw 'no method';
	}

	let method = methods[0];
	if (!method) {
		console.warn('missing method to validate against');
		return;
  }

	let graph = GetCurrentGraph();
	let screen_option = GetNodeById(args.screenOption, graph);

	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const components = GetNodesLinkedTo(graph, {
		id: screen_option.id,
		link: LinkType.Component
	});

	let result: any[] = [];
	components.map((component: { id: any }) => {
		const subcomponents = GetNodesLinkedTo(graph, {
			id: component.id,
			link: LinkType.Component
		});
		const buttonComponents = subcomponents.filter((x: any) => GetNodeProp(x, NodeProperties.ExecuteButton));
		if (buttonComponents && buttonComponents.length === 1) {
			const subcomponent = buttonComponents[0];
			GetNodesLinkedTo(graph, {
				id: subcomponent.id,
				link: LinkType.EventMethod
			}).filter((x: any) =>
				[ ComponentEvents.onClick, ComponentEvents.onPress ].some(
					(v) => v === GetNodeProp(x, NodeProperties.EventType)
				)
			);
		}
		result.push(
			...AppendValidations({
				subcomponents,
				component,
				screen_option,
				method,
				viewPackages
			})
		);
	});
}
