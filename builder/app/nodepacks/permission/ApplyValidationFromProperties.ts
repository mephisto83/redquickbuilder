import {
	NodesByType,
	GetCurrentGraph,
	ADD_NEW_NODE,
	GetNodeTitle,
	GetModelPropertyChildren,
	GetFunctionMethodKey,
	GetValidatorMethod
} from '../../actions/uiactions';
import {
	NodeTypes,
	LinkType,
	NodeProperties,
	LinkProperties,
	NodeAttributePropertyTypes
} from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';
import { GetNodeLinkedTo, GetNodeProp } from '../../methods/graph_methods';
import { uuidv4 } from '../../utils/array';
import { FunctionTemplateKeys } from '../../constants/functiontypes';
import NameLikeValidation from '../validation/NameLikeValidation';
import DescriptionLikeValidation from '../validation/DescriptionLikeValidation';
import AddressValidation from '../validation/AddressValidation';
import StringValidation from '../validation/StringValidation';
import { EmailValidationPart, CreditCardValidationPart, OneOfAttributePart } from '../validation/validation-parts';

export default function ApplyValidationFromProperties(filter?: any) {
	let result: any[] = [];
	let graph = GetCurrentGraph();
	filter = filter || (() => true);

	let viewPackage: any = {
		[NodeProperties.ViewPackage]: uuidv4()
	};
	let methodKey = FunctionTemplateKeys.Model;
	let models: Node[] = NodesByType(null, NodeTypes.Model).filter(filter);
	let validators = NodesByType(null, NodeTypes.Validator);
	validators.forEach((validator: Node) => {
		let methodNode = GetValidatorMethod(validator);
		let model = GetNodeLinkedTo(graph, {
			id: validator.id,
			link: LinkType.ValidatorModel
		});
		if (model && models.find((n: Node) => n.id === model.id)) {
			let condition: Node;
			let properties = GetModelPropertyChildren(GetFunctionMethodKey(validator), methodKey);

			result.push(
				() => {
					return {
						operation: ADD_NEW_NODE,
						options() {
							return {
								nodeType: NodeTypes.Condition,
								properties: {
									...viewPackage || {},
									[NodeProperties.UIText]: `${GetNodeTitle(validator)} Condition`
								},
								parent: validator.id,
								groupProperties: {},
								linkProperties: {
									properties: { ...LinkProperties.ConditionLink }
								},
								callback: (_condition: Node) => {
									condition = _condition;
								}
							};
						}
					};
				},
				...properties
					.map((prop: Node) => {
						let attr: Node = GetNodeLinkedTo(graph, {
							id: prop.id,
							link: LinkType.AttributeLink
						});
						if (attr && condition) {
							let attributeType = GetNodeProp(attr, NodeProperties.UIAttributeType, graph);
							switch (attributeType) {
								case NodeAttributePropertyTypes.ADDRESS:
									return function() {
										return AddressValidation({
											condition: methodKey ? condition.id : null,
											property: prop.id,
											methodKey: methodKey,
											methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
										});
									};
									break;
								case NodeAttributePropertyTypes.COUNTRY:
								case NodeAttributePropertyTypes.NAME:
									return function() {
										return NameLikeValidation({
											condition: methodKey ? condition.id : null,
											property: prop.id,
											methodKey: methodKey,
											methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
										});
									};
									break;
								case NodeAttributePropertyTypes.CARMAKE:
								case NodeAttributePropertyTypes.CARMODEL:
								case NodeAttributePropertyTypes.CARYEAR:
									return function() {
										return function() {
											return StringValidation({
												condition: methodKey ? condition.id : null,
												property: prop.id,
												methodKey: methodKey,
												minLength: 1,
												methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
											});
										};
									};

								case NodeAttributePropertyTypes.EMAIL:
									return function() {
										return function() {
											return StringValidation({
												condition: condition ? condition.id : null,
												property: prop.id,
												methodKey: methodKey,
												sections: {
													...EmailValidationPart()
												},
												minLength: 1,
												methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
											});
										};
									};
								case NodeAttributePropertyTypes.YEAR:
									return function() {
										return function() {
											return StringValidation({
												condition: condition ? condition.id : null,
												property: prop.id,
												methodKey: methodKey,
												maxLength: 4,
												minLength: 4,
												methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
											});
										};
									};
								case NodeAttributePropertyTypes.ENUMERATION:
									let enumNode = GetNodeLinkedTo(graph, {
										id: prop.id,
										link: LinkType.Enumeration
									});
									if (enumNode) {
										return function() {
											return StringValidation({
												condition: condition ? condition.id : null,
												property: prop.id,
												methodKey: methodKey,
												sections: {
													...OneOfAttributePart(enumNode)
												},
												minLength: 1,
												methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
											});
										};
									} else {
										return false;
									}
								case NodeAttributePropertyTypes.CREDITCARD:
									return function() {
										return function() {
											return StringValidation({
												condition: condition ? condition.id : null,
												property: prop.id,
												methodKey: methodKey,
												sections: {
													...CreditCardValidationPart()
												},
												methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
											});
										};
									};
								case NodeAttributePropertyTypes.LONGSTRING:
									return function() {
										return DescriptionLikeValidation({
											condition: methodKey ? condition.id : null,
											property: prop.id,
											methodKey: methodKey,
											methodType: GetNodeProp(methodNode, NodeProperties.FunctionType)
										});
									};
									break;
							}
						}
						return false;
					})
					.filter((x) => x)
			);
		}
	});

	return result;
}
