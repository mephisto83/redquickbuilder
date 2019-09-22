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
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_selection'
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