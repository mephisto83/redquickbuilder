import { NodeProperties } from "./nodetypes";
export const DataChainFunctionKeys = {
    ModelProperty: 'Model - Property',
    Model: 'Model',
    Pass: 'Pass',
    StringConcat: 'String Concat {0} {1}'
};
export const DataChainFunctions = {
    [DataChainFunctionKeys.ModelProperty]: {
        ui: {
            model: true,
            property: true
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_property_selection'
    },
    [DataChainFunctionKeys.Model]: {
        ui: {
            model: true,
            property: false
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_selection'
    },
    [DataChainFunctionKeys.Pass]: {
        ui: {
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_selection'
    },
    [DataChainFunctionKeys.StringConcat]: {
        ui: {
            node_1: true,
            node_2: true
        },
        filter: {
            [NodeProperties.MergeNode]: true
        },
        value: 'string_concat_2_values'
    }
};