import * as GraphMethods from '../methods/graph_methods';
import {
    NodeTypes,
    NodesByType,
    GetRootGraph
} from '../actions/uiactions';
import {
    LinkType
} from '../constants/nodetypes';


export default class FunctionGenerator {
    static GenerateFirebaseGeneratorRequirements(state: any) {
        const functions = NodesByType(state, NodeTypes.Function)
        let root = GetRootGraph(state);

        return functions.map((func: any) => {

            let functionOperators = GraphMethods.getNodesByLinkType(root, {
                id: func.id,
                type: LinkType.FunctionOperator,
                direction: GraphMethods.SOURCE
            });
            let functionApiParameters = GraphMethods.getNodesByLinkType(root, {
                id: func.id,
                type: LinkType.FunctionApiParameters,
                direction: GraphMethods.SOURCE
            });
            let functionOutput = GraphMethods.getNodesByLinkType(root, {
                id: func.id,
                type: LinkType.FunctionOutputType,
                direction: GraphMethods.SOURCE
            });
            return {
                id: func.id,
                properties: { ...func.properties },
                functionApiParameters: functionApiParameters.map((node) => {
                    return {
                        id: node?.id,
                        properties: node?.properties,
                        attributes: GraphMethods.getNodesByLinkType(root, {
                            id: node?.id,
                            type: LinkType.AttributeLink,
                            direction: GraphMethods.SOURCE
                        }).map((node) => {
                            return { id: node?.id, properties: node?.properties }
                        }),
                        functionOperators,
                        functionApiParameterType: GraphMethods.getNodesByLinkType(root, {
                            id: node?.id,
                            type: LinkType.FunctionApiParameterType,
                            direction: GraphMethods.TARGET
                        }).map((node) => {
                            return { id: node?.id, properties: node?.properties }
                        })
                    }
                }),
                functionOutput: functionOutput.map((node) => {
                    return {
                        id: node?.id, properties: node?.properties,
                        attributes: GraphMethods.getNodesByLinkType(root, {
                            id: node?.id,
                            type: LinkType.AttributeLink,
                            direction: GraphMethods.TARGET
                        }).map((node) => {
                            return { id: node?.id, properties: node?.properties }
                        }),
                        functionApiParameterType: GraphMethods.getNodesByLinkType(root, {
                            id: node?.id,
                            type: LinkType.FunctionOutputType,
                            direction: GraphMethods.SOURCE
                        }).map((node) => {
                            return { id: node?.id, properties: node?.properties }
                        })
                    }
                }),
                functionOperator: GraphMethods.getNodesByLinkType(root, {
                    id: func.id,
                    type: LinkType.FunctionOperator,
                    direction: GraphMethods.SOURCE
                }).map((node) => {
                    return { id: node?.id, properties: node?.properties }
                }),
                modelType: GraphMethods.getNodesByLinkType(root, {
                    id: func.id,
                    type: LinkType.ModelTypeLink,
                    direction: GraphMethods.SOURCE
                }).map((node) => {
                    return { id: node?.id, properties: node?.properties }
                }),
                permissionSource: GraphMethods.getNodesByLinkType(root, {
                    id: func.id,
                    type: LinkType.PermissionSource,
                    direction: GraphMethods.SOURCE
                }).map((node) => {
                    return { id: node?.id, properties: node?.properties }
                }),
                permission: GraphMethods.getNodesByLinkType(root, {
                    id: func.id,
                    type: LinkType.Permission,
                    direction: GraphMethods.SOURCE
                }).map((node) => {
                    return { id: node?.id, properties: node?.properties }
                })
            }
        })

    }
}
