import { NodeProperties } from "./nodetypes";
export const DataChainFunctionKeys = {
    ModelProperty: 'Model - Property',
    Required: 'Required',
    Not: 'Not',
    EmailValidation: 'Email validation',
    GreaterThan: 'Greater Than',
    LessThan: 'Less Than',
    MaxLength: 'Max Length',
    MinLength: 'Min Length',
    EqualsLength: 'Equals Length',
    GreaterThanOrEqualTo: 'Greater than or equal to',
    AlphaNumericLike: 'Alphanumeric like',
    AlphaNumeric: 'Alphanumeric',
    AlphaOnly: 'Alpha only',
    LessThanOrEqualTo: 'Less than or equal to',
    Equals: 'Are Equal',
    BooleanAnd: 'Boolean And',
    BooleanOr: 'Boolean Or',
    Property: 'Property',
    Validation: 'Validation',
    Model: 'Model',
    Pass: 'Pass',
    ReferenceDataChain: 'Data Chain Ref.',
    StringConcat: 'String Concat {0} {1}'
};
export const DataChainFunctions = {
    [DataChainFunctionKeys.Not]: {
        ui: {
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Not'
    },
    [DataChainFunctionKeys.Validation]: {
        ui: {
            dataref: NodeProperties.DataChainReference,
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Validation'
    },
    [DataChainFunctionKeys.Required]: {
        ui: {
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Required'
    },
    [DataChainFunctionKeys.Property]: {
        ui: {
            model: NodeProperties.UIModelType,
            property: NodeProperties.Property
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Property'
    },
    [DataChainFunctionKeys.BooleanAnd]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            node_2: NodeProperties.ChainNodeInput2
        },
        merge: true,
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'BooleanAnd'
    },
    [DataChainFunctionKeys.Equals]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            node_2: NodeProperties.ChainNodeInput2
        },
        merge: true,
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'AreEquals'
    },
    [DataChainFunctionKeys.BooleanOr]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            node_2: NodeProperties.ChainNodeInput2
        },
        merge: true,
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'BooleanOr'
    },
    [DataChainFunctionKeys.AlphaNumericLike]: {
        ui: {
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'AlphaNumericLike'
    },
    [DataChainFunctionKeys.AlphaNumeric]: {
        ui: {
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'AlphaNumeric'
    },
    [DataChainFunctionKeys.AlphaOnly]: {
        ui: {
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'AlphaOnly'
    },
    [DataChainFunctionKeys.EmailValidation]: {
        ui: {
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'email_validation'
    },
    [DataChainFunctionKeys.LessThanOrEqualTo]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'LessThanOrEqualTo'
    },
    [DataChainFunctionKeys.GreaterThanOrEqualTo]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'GreaterThanOrEqualTo'
    },
    [DataChainFunctionKeys.EqualsLength]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'EqualsLength'
    },
    [DataChainFunctionKeys.MinLength]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'MinLength'
    },
    [DataChainFunctionKeys.MaxLength]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'MaxLength'
    },
    [DataChainFunctionKeys.LessThan]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'LessThan'
    },
    [DataChainFunctionKeys.GreaterThan]: {
        ui: {
            value: NodeProperties.value,
            number: NodeProperties.Number
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'greater_than_validation'
    },
    [DataChainFunctionKeys.ReferenceDataChain]: {
        ui: {
            dataref: NodeProperties.DataChainReference
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'reference_data_chain'
    },
    [DataChainFunctionKeys.ModelProperty]: {
        ui: {
            model: NodeProperties.UIModelType,
            property: NodeProperties.Property
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_property_selection'
    },
    [DataChainFunctionKeys.Model]: {
        ui: {
            model: NodeProperties.UIModelType,
            property: false
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_selection'
    },
    [DataChainFunctionKeys.Pass]: {
        ui: {
            value: NodeProperties.value
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'pass_selection'
    },
    [DataChainFunctionKeys.StringConcat]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            node_2: NodeProperties.ChainNodeInput2
        },
        merge: true,
        filter: {
            [NodeProperties.MergeNode]: true
        },
        value: 'string_concat_2_values'
    }
};