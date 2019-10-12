import { NodeProperties, LinkProperties, GroupProperties, NodeTypes } from "./nodetypes";
import { ADD_LINK_BETWEEN_NODES, CHANGE_NODE_PROPERTY, REMOVE_LINK_BETWEEN_NODES, ADD_NEW_NODE, SELECTED_NODE, GetNodeProp, GetDataChainNextId, Visual } from "../actions/uiactions";
export const DataChainFunctionKeys = {
    ModelProperty: 'Model - Property',
    Required: 'Required',
    Not: 'Not',
    CollectResults: 'Collect values',
    Selector: 'Selector',
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
    IfTrue: 'IfTrue',
    Title: 'Title',
    IfFalse: 'IfFalse',
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
    [DataChainFunctionKeys.Title]: {
        ui: {
            value: NodeProperties.Value,
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Title'
    },
    [DataChainFunctionKeys.Selector]: {
        ui: {
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'Selector'
    },
    [DataChainFunctionKeys.IfTrue]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            value: NodeProperties.Value,
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'IfTrue'
    },
    [DataChainFunctionKeys.IfFalse]: {
        ui: {
            node_1: NodeProperties.ChainNodeInput1,
            value: NodeProperties.Value,
        },
        filter: {
            [NodeProperties.NODEType]: true
        },
        value: 'IfFalse'
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
export function connectNodeChain(prop) {
    return function (currentNode, value) {
        var id = currentNode.id;
        this.props.graphOperation(REMOVE_LINK_BETWEEN_NODES, {
            source: currentNode.properties[prop],
            target: id
        })
        this.props.graphOperation(CHANGE_NODE_PROPERTY, {
            prop,
            id,
            value
        });
        this.props.graphOperation(ADD_LINK_BETWEEN_NODES, {
            source: value,
            target: id,
            properties: { ...LinkProperties.DataChainLink }
        })
    }
}
export const DataChainContextMethods = {
    Input1: connectNodeChain(NodeProperties.ChainNodeInput1),
    Value: connectNodeChain(NodeProperties.Value),
    SplitDataChain: function (currentNode) {
        let id = currentNode.id;
        let { state } = this.props;
        this.props.graphOperation(ADD_NEW_NODE, {
            parent: Visual(state, SELECTED_NODE),
            nodeType: NodeTypes.DataChain,
            groupProperties: {
                [GroupProperties.ExternalEntryNode]: GetNodeProp(currentNode, NodeProperties.ChainParent),
                [GroupProperties.GroupEntryNode]: currentNode.id,
                [GroupProperties.GroupExitNode]: currentNode.id,
                [GroupProperties.ExternalExitNode]: GetDataChainNextId(currentNode.id)
            },
            properties: {
                [NodeProperties.ChainParent]: currentNode.id
            },
            linkProperties: {
                properties: { ...LinkProperties.DataChainLink }
            }
        });
    }
}