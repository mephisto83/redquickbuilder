import AppendValidations from '../screens/AppendValidations';
import { NodeProperties, Methods, NodeTypes, LinkType } from '../../constants/nodetypes';
import { uuidv4 } from '../../utils/array';
import {
	NodesByType,
	GetNodeProp,
	GetNodeByProperties,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	ValidationPropName
} from '../../actions/uiActions';
import { GetNodesLinkedTo, GetNodeLinkedTo } from '../../methods/graph_methods';
import AddRegistrationValidation from './AddRegistrationValidation';

export default async function ApplyLoginValidations(progressFunc: any) {
	const viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4()
	};
	const registerMethod = GetNodeByProperties({
		[NodeProperties.FunctionType]: 'Register',
		[NodeProperties.NODEType]: NodeTypes.Method
	});
	if (!registerMethod) {
		throw new Error('missing register method, required for adding validation');
	}
	const screens = NodesByType(null, NodeTypes.Screen).filter((x: any) =>
		[ 'Register' ].some(
			(v) =>
				v === GetNodeProp(x, NodeProperties.NodePackage) ||
				v === GetNodeProp(x, NodeProperties.ViewPackageTitle)
		)
	);
	await screens.forEachAsync(async (screen: any) => {
		const screenOptions = GetNodesLinkedTo(null, {
			id: screen.id,
			componentType: NodeTypes.ScreenOption
		});
		await screenOptions.forEachAsync(async (screenOption: any, index: any, length: any) => {
			const result: any = [];
			const components = GetNodesLinkedTo(null, {
				id: screenOption.id,
				componentType: NodeTypes.ComponentNode
			});
			components.forEach((component: any) => {
				const subcomponents = GetNodesLinkedTo(null, {
					id: component.id,
					componentType: NodeTypes.ComponentNode
				});
				const validationArgs: any = {};
				subcomponents.forEach((subcomponent: any) => {
					const propertyNode = GetNodeLinkedTo(null, {
						id: subcomponent.id,
						link: LinkType.PropertyLink,
						componentType: NodeTypes.Property
					});

					if (propertyNode) {
						const name = GetNodeProp(propertyNode, NodeProperties.ValidationPropertyName);

						validationArgs[name] = propertyNode.id;
					}
				});

				const validationSets = GetNodesLinkedTo(null, {
					id: registerMethod.id,
					componentType: NodeTypes.Validator
				});

				result.push(
					...(!validationSets.length
						? AddRegistrationValidation({
								method: registerMethod.id,
								...validationArgs
							})
						: []),
					...AppendValidations({
						subcomponents,
						component,
						methodType: Methods.Create,
						screen_option: screenOption,
						InstanceUpdate: false,
						method: registerMethod.id,
						viewPackages
					})
				);
			});

			graphOperation(result)(GetDispatchFunc(), GetStateFunc());

			await progressFunc(index / length);
		});
	});
}
