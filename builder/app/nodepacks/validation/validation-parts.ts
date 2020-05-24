import { uuidv4 } from '../../utils/array';
import { GetNodeById, GetNodeProp } from '../../actions/uiactions';
import { NodeProperties } from '../../constants/nodetypes';

export function EmailValidationPart() {
	return {
		[uuidv4()]: {
			type: 'email',
			code: {
				csharp: 'EmailAttribute'
			},
			template: './app/templates/validation/validation_generic.tpl',
			templatejs: './app/templates/validation/validation_generic_js.tpl',
			arguments: {
				value: {
					type: 'STRING',
					nodeType: 'model-property'
				}
			}
		}
	};
}

export function CreditCardValidationPart() {
	return {
		[uuidv4()]: {
			type: 'credit',
			code: { csharp: 'CreditCardAttribute' },
			template: './app/templates/validation/validation_generic.tpl',
			templatejs: './app/templates/validation/validation_generic_js.tpl',
			arguments: { value: { type: 'STRING', nodeType: 'model-property' } }
		}
	};
}

export function OneOfAttributePart(enumNode: Node | string) {
	if (typeof enumNode === 'string') {
		enumNode = GetNodeById(enumNode);
	}
	let enums = GetNodeProp(enumNode, NodeProperties.Enumeration) || [];
	let enumeration: { [str: string]: boolean } = {};
	enums.forEach((enumm: { id: string }) => {
		enumeration[enumm.id] = true;
	});
	return {
		[uuidv4()]: {
			type: 'one-of',
			code: {
				csharp: 'OneOfAttribute'
			},
			template: './app/templates/filter/one-of.tpl',
			templatejs: './app/templates/filter/one-ofjs.tpl',
			arguments: {
				value: {
					type: 'STRING',
					nodeType: 'model-property'
				},
				nodeType: 'enumeration',
				reference: {
					types: [ 'enumeration', 'extension-type' ]
				}
			},
			node: '9d82ef30-5bf5-4d3e-b541-b1459ab59a34',
			enumeration
		}
	};
}

export function AlphaNumericValidationPart() {
	return {
		[uuidv4()]: {
			type: 'alphanumeric',
			code: { csharp: 'AlphaNumericAttribute' },
			template: './app/templates/validation/validation_generic.tpl',
			templatejs: './app/templates/validation/validation_generic_js.tpl',
			arguments: { value: { type: 'STRING', nodeType: 'model-property' } }
		}
	};
}

export function NumericIntValidationPart() {
	return {
		[uuidv4()]: {
			type: 'numericint',
			code: { csharp: 'NumericIntAttribute' },
			template: './app/templates/validation/validation_generic.tpl',
			templatejs: './app/templates/validation/validation_generic_js.tpl',
			arguments: { value: { type: 'STRING', nodeType: 'model-property' } }
		}
	};
}