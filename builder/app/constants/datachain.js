import { NodeProperties } from "./nodetypes";

export const DataChainFunctions = {
    'Model - Property': {
        ui: {
            model: true,
            property: true
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'model_property_selection'
    },
    'String Concat {0} {1}': {
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