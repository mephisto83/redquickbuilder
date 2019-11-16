import { MethodFunctions, FunctionTypes, FunctionTemplateKeys, FunctionMethodTypes, HTTP_METHODS } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties, Methods, UITypes, GroupProperties, LinkType, LinkPropertyKeys } from "./nodetypes";
import {
    ADD_NEW_NODE,
    GetAgentNodes,
    GetUsers,
    GetNodeProp,
    GetNodeTitle,
    PerformGraphOperation,
    CHANGE_NODE_PROPERTY,
    ADD_LINK_BETWEEN_NODES,
    GetNodeById,
    ModelNotConnectedToFunction,
    GetCurrentGraph,
    GetStateFunc,
    GetDispatchFunc,
    NodePropertyTypes,
    Node,
    Visual,
    SELECTED_NODE,
    GetState,
    NEW_SCREEN_OPTIONS,
    NEW_COMPONENT_NODE,
    GetModelPropertyChildren,
    GetDataChainNextId,
    GetNodesByProperties,
    ViewTypes,
    GetLinkProperty,
    setSharedComponent,
    getViewTypeEndpointsForDefaults,
    NEW_DATA_SOURCE,
    updateMethodParameters
} from "../actions/uiactions";
import { newNode, CreateLayout, SetCellsLayout, GetCellProperties, GetFirstCell, GetAllChildren, FindLayoutRootParent, GetChildren, GetNode, existsLinkBetween, getNodesByLinkType, TARGET, SOURCE, GetNodesLinkedTo, findLink, GetLinkBetween } from "../methods/graph_methods";
import { ComponentTypes, InstanceTypes, ARE_BOOLEANS, ARE_HANDLERS, HandlerTypes, ARE_TEXT_CHANGE, ON_BLUR, ON_CHANGE, ON_CHANGE_TEXT, ON_FOCUS, VALUE, SHARED_COMPONENT_API, GENERAL_COMPONENT_API, SCREEN_COMPONENT_EVENTS } from "./componenttypes";
import { debug } from "util";
import * as Titles from '../components/titles';
import { createComponentApi, addComponentApi, getComponentApiList } from "../methods/component_api_methods";
import { DataChainFunctionKeys, DataChainFunctions, SplitDataCommand, ConnectChainCommand, AddChainCommand } from "./datachain";
import { uuidv4 } from "../utils/array";


export const GetSpecificModels = {
    type: 'get-specific-models',
    method: (args) => {
        let { model, dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
        let agents = GetAgentNodes();

        agents.map(agent => {
            let methodProps;

            if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type)) {
                let outer_commands = [{
                    operation: ADD_NEW_NODE,
                    options: {
                        nodeType: NodeTypes.Method,
                        parent: model.id,
                        groupProperties: {
                        },
                        properties: {
                            [NodeProperties.NodePackage]: model.id,
                            [NodeProperties.NodePackageType]: GetSpecificModels.type,
                            [NodeProperties.NodePackageAgent]: agent.id,
                            [NodeProperties.FunctionType]: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific,
                            [NodeProperties.MethodType]: Methods.GetAll,
                            [NodeProperties.HttpMethod]: HTTP_METHODS.POST,
                            [NodeProperties.UIText]: `${GetNodeTitle(model)} Get Specific Objects`
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.FunctionOperator }
                        },
                        callback: (methodNode) => {
                            setTimeout(() => {
                                new Promise((resolve) => {

                                    let { constraints } = MethodFunctions[FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific];
                                    let commands = [];
                                    let permissionNode = null;
                                    Object.values(constraints).map(constraint => {
                                        switch (constraint.key) {
                                            case FunctionTemplateKeys.Model:
                                            case FunctionTemplateKeys.Agent:
                                            case FunctionTemplateKeys.User:
                                            case FunctionTemplateKeys.ModelOutput:
                                                methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                if (constraint[NodeProperties.IsAgent]) {
                                                    methodProps[constraint.key] = agent.id;
                                                }
                                                else if (constraint.key === FunctionTemplateKeys.User) {
                                                    methodProps[constraint.key] = GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
                                                }
                                                else {
                                                    methodProps[constraint.key] = model.id;
                                                }
                                                break;
                                            case FunctionTemplateKeys.Permission:
                                            case FunctionTemplateKeys.ModelFilter:
                                                let perOrModelNode = null;
                                                PerformGraphOperation([({
                                                    operation: ADD_NEW_NODE,
                                                    options: {
                                                        parent: methodNode.id,
                                                        nodeType: constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter,
                                                        groupProperties: {
                                                        },
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} ${constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter}`
                                                        },
                                                        linkProperties: {
                                                            properties: { ...LinkProperties.FunctionOperator }
                                                        },
                                                        callback: (newNode) => {
                                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                            methodProps[constraint.key] = newNode.id;
                                                            perOrModelNode = newNode;
                                                        }
                                                    }
                                                })])(dispatch, getState);
                                                if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                                                    commands = [...commands, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterAgent,
                                                            id: perOrModelNode.id,
                                                            value: agent.id
                                                        }
                                                    }, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterModel,
                                                            id: perOrModelNode.id,
                                                            value: model.id
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: model.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.ModelTypeLink }
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: agent.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.AgentTypeLink }
                                                        }
                                                    }]
                                                }
                                                break;
                                        }
                                        commands = [...commands, ...[{
                                            operation: CHANGE_NODE_PROPERTY,
                                            options: {
                                                prop: NodeProperties.MethodProps,
                                                id: methodNode.id,
                                                value: methodProps
                                            }
                                        }, {
                                            operation: ADD_LINK_BETWEEN_NODES,
                                            options: {
                                                target: methodProps[constraint.key],
                                                source: methodNode.id,
                                                properties: { ...LinkProperties.FunctionOperator }
                                            }
                                        }]];
                                    })
                                    if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type, NodeTypes.Controller)) {
                                        commands.push({
                                            operation: ADD_NEW_NODE,
                                            options: {
                                                nodeType: NodeTypes.Controller,
                                                properties: {
                                                    [NodeProperties.NodePackage]: model.id,
                                                    [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                    [NodeProperties.NodePackageAgent]: agent.id,
                                                    [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Controller`
                                                },
                                                linkProperties: {
                                                    properties: { ...LinkProperties.FunctionOperator }
                                                },
                                                callback: (controllerNode) => {
                                                    setTimeout(() => {
                                                        if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type, NodeTypes.Maestro)) {
                                                            PerformGraphOperation([{
                                                                operation: ADD_NEW_NODE,
                                                                options: {
                                                                    nodeType: NodeTypes.Maestro,
                                                                    parent: controllerNode.id,

                                                                    properties: {
                                                                        [NodeProperties.NodePackage]: model.id,
                                                                        [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                                        [NodeProperties.NodePackageAgent]: agent.id,
                                                                        [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Maestro`
                                                                    },
                                                                    linkProperties: {
                                                                        properties: { ...LinkProperties.MaestroLink }
                                                                    },
                                                                    callback: (maestroNode) => {
                                                                        setTimeout(() => {
                                                                            PerformGraphOperation([{
                                                                                operation: ADD_LINK_BETWEEN_NODES,
                                                                                options: {
                                                                                    target: methodNode.id,
                                                                                    source: maestroNode.id,
                                                                                    properties: {
                                                                                        ...LinkProperties.FunctionLink
                                                                                    }
                                                                                }
                                                                            }])(dispatch, getState);

                                                                        }, 1500)
                                                                    }
                                                                }
                                                            }])(dispatch, getState)
                                                        }

                                                    }, 1500)
                                                }
                                            }
                                        });
                                    }
                                    PerformGraphOperation(commands)(dispatch, getState)
                                    resolve();
                                })
                            }, 1500)
                        }
                    }
                }]
                PerformGraphOperation(outer_commands)(dispatch, getState);
            }
        });
    },
    methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
}

export const GetAllModels = {
    type: 'get-all-models',
    method: CreateFunction({
        nodePackageType: 'get-all-models',
        methodType: Methods.GetAll,
        httpMethod: HTTP_METHODS.GET,
        functionType: FunctionTypes.Get_Agent_Value__IListObject,
        functionName: `Get All`
    }),
    methodType: FunctionTypes.Get_Agent_Value__IListObject
}

export const CreateLoginModels = {
    type: 'login-models',
    methodType: 'Login Models',
    method: () => {
        // let currentGraph = GetCurrentGraph(GetStateFunc()());
        // currentGraph = newNode(currentGraph);
        let nodePackageType = 'login-models';
        let nodePackage = 'login-models';
        PerformGraphOperation([({
            operation: ADD_NEW_NODE,
            options: {
                nodeType: NodeTypes.Model,
                // groupProperties: {},
                properties: {
                    [NodeProperties.NodePackage]: nodePackage,
                    [NodeProperties.NodePackageType]: nodePackageType,
                    [NodeProperties.UIText]: `Blue Login Model`
                },
                callback: (newNode) => {
                    // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                    // methodProps[constraint.key] = newNode.id;
                    // perOrModelNode = newNode;
                    setTimeout(() => {
                        PerformGraphOperation([
                            { propName: 'User Name' },
                            { propName: 'Password' },
                            { propName: 'Remember Me' }
                        ].map(v => {
                            let { propName } = v;
                            return ({
                                operation: ADD_NEW_NODE,
                                options: {
                                    nodeType: NodeTypes.Property,
                                    linkProperties: {
                                        properties: { ...LinkProperties.PropertyLink }
                                    },
                                    groupProperties: {
                                    },
                                    parent: newNode.id,
                                    properties: {
                                        [NodeProperties.NodePackage]: nodePackage,
                                        [NodeProperties.UIAttributeType]: NodePropertyTypes.STRING,
                                        [NodeProperties.NodePackageType]: nodePackageType,
                                        [NodeProperties.UIText]: propName
                                    }
                                }
                            });
                        }))(GetDispatchFunc(), GetStateFunc());
                    }, 1000);
                }
            }
        }), ({
            operation: ADD_NEW_NODE,
            options: {
                nodeType: NodeTypes.Model,
                // groupProperties: {},
                properties: {
                    [NodeProperties.NodePackage]: nodePackage,
                    [NodeProperties.NodePackageType]: nodePackageType,
                    [NodeProperties.UIText]: `Blue Register View Model`
                },
                callback: (newNode) => {
                    // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                    // methodProps[constraint.key] = newNode.id;
                    // perOrModelNode = newNode;
                    setTimeout(() => {
                        PerformGraphOperation([
                            { propName: 'User Name' },
                            { propName: 'Email', propType: NodePropertyTypes.EMAIL },
                            { propName: 'Password' },
                            { propName: 'Confirm Password' }
                        ].map(v => {
                            let { propName, propType } = v;
                            return ({
                                operation: ADD_NEW_NODE,
                                options: {
                                    nodeType: NodeTypes.Property,
                                    linkProperties: {
                                        properties: { ...LinkProperties.PropertyLink }
                                    },
                                    groupProperties: {},
                                    parent: newNode.id,
                                    properties: {
                                        [NodeProperties.NodePackage]: nodePackage,
                                        [NodeProperties.UIAttributeType]: propType || NodePropertyTypes.STRING,
                                        [NodeProperties.NodePackageType]: nodePackageType,
                                        [NodeProperties.UIText]: propName
                                    }
                                }
                            });
                        }))(GetDispatchFunc(), GetStateFunc());
                    }, 1000);
                }
            }
        })])(GetDispatchFunc(), GetStateFunc());
    }
}

export const AddAgentUser = {
    type: 'add-agent-user',
    methodType: 'Add User Agent',
    method: () => {
        let userId = null;
        PerformGraphOperation([{
            operation: ADD_NEW_NODE,
            options: function () {
                return {
                    nodeType: NodeTypes.Model,
                    callback: (node) => {
                        userId = node.id;
                    },
                    properties: {
                        [NodeProperties.UIText]: `User`,
                        [NodeProperties.IsUser]: true
                    }
                }
            }
        }, {
            operation: ADD_NEW_NODE,
            options: function () {
                return {
                    nodeType: NodeTypes.Model,
                    properties: {
                        [NodeProperties.UIText]: `Agent`,
                        [NodeProperties.IsAgent]: true,
                        [NodeProperties.UIUser]: userId
                    },
                    links: [{
                        target: userId,
                        linkProperties: {
                            properties: { ...LinkProperties.UserLink }
                        }
                    }]
                }
            }
        }])(GetDispatchFunc(), GetStateFunc());
    }
}

export const CreateDefaultView = {
    type: 'Create View - Form',
    methodType: 'React Native Views',
    method: (args = {}) => {
        let {
            viewName,
            viewType,
            isDefaultComponent,
            isSharedComponent,
            isList,
            model,
            chosenChildren = []
        } = args;
        let state = GetState();
        var currentNode = model || Node(state, Visual(state, SELECTED_NODE));
        let screenNodeId = null;
        let screenComponentId = null;
        let listComponentId = null;
        let screenNodeOptionId = null;
        let childComponents = [];
        let modelComponentSelectors = [];
        let modelComponentDataChains = [];
        let layout = null;
        let listLayout = null;
        let viewModelNodeDirtyId = null;
        let viewModelNodeFocusId = null;
        let viewModelNodeBlurId = null;
        let viewModelNodeFocusedId = null;
        let viewModelNodeId = null;
        let createConnections = [];
        let createListConnections = [];
        viewName = viewName || GetNodeTitle(currentNode);
        let useModelInstance = viewType === ViewTypes.Update || viewType === ViewTypes.Get || viewType === ViewTypes.GetAll || viewType === ViewTypes.Delete;
        let viewPackage = {
            [NodeProperties.ViewPackage]: uuidv4(),
            [NodeProperties.ViewPackageTitle]: viewName
        };
        let viewComponentType = null;
        switch (viewType) {
            case ViewTypes.Get:
            case ViewTypes.GetAll:
                viewComponentType = ComponentTypes.ReactNative.Text.key;
                break;
            default:
                viewComponentType = ComponentTypes.ReactNative.Input.key;
                break;
        }
        let dataSourceId;
        let vmsIds = () => ([viewModelNodeDirtyId, viewModelNodeFocusId, viewModelNodeBlurId, viewModelNodeFocusedId, viewModelNodeId]);
        if (GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Model) {
            let modelChildren = GetModelPropertyChildren(currentNode.id);
            if (chosenChildren && chosenChildren.length) {
                modelChildren = modelChildren.filter(x => chosenChildren.some(v => v === x.id));
            }
            let modelProperties = modelChildren.filter(x => !GetNodeProp(x, NodeProperties.IsDefaultProperty));
            childComponents = modelProperties.map(v => null);
            let apiListLinkOperations = [];
            let screenComponentEvents = [];
            PerformGraphOperation([!isSharedComponent ? {
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.Screen,
                    callback: (screenNode) => {
                        screenNodeId = screenNode.id;
                    },
                    properties: {
                        ...viewPackage,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                        [NodeProperties.UIText]: `${viewName} Form`,
                        [NodeProperties.Model]: currentNode.id
                    }
                }
            } : false, ...(!isSharedComponent ? (SCREEN_COMPONENT_EVENTS.map(t => {
                return {
                    operation: ADD_NEW_NODE,
                    options: function () {
                        return {
                            nodeType: NodeTypes.LifeCylceMethod,
                            properties: {
                                ...viewPackage,
                                [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                                [NodeProperties.UIText]: `${t}`,
                            },
                            links: [{
                                target: screenNodeId,
                                linkProperties: {
                                    properties: { ...LinkProperties.LifeCylceMethod }
                                }
                            }],
                            callback: (screenNode) => {
                                screenComponentEvents.push(screenNode.id);
                            },
                        }
                    }
                }
            })) : []), !isSharedComponent ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeId = res[0].id;
                        return false;
                    }
                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNode) => {
                            viewModelNodeId = viewModelNode.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM ${useModelInstance ? InstanceTypes.ModelInstanceBlur : 'Instance'}`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            } : false, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceDirty : InstanceTypes.ScreenInstanceDirty,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeDirtyId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeDirty) => {
                            viewModelNodeDirtyId = viewModelNodeDirty.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM ${useModelInstance ? InstanceTypes.ModelInstanceBlur : 'Instance'} Dirty`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceDirty : InstanceTypes.ScreenInstanceDirty
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    };
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceFocus : InstanceTypes.ScreenInstanceFocus,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeFocusId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeFocus) => {
                            viewModelNodeFocusId = viewModelNodeFocus.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM ${useModelInstance ? InstanceTypes.ModelInstanceBlur : 'Instance'} Focus`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceFocus : InstanceTypes.ScreenInstanceFocus
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceFocused : InstanceTypes.ScreenInstanceFocused,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeFocusedId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeFocused) => {
                            viewModelNodeFocusedId = viewModelNodeFocused.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM ${useModelInstance ? InstanceTypes.ModelInstanceBlur : 'Instance'} Focused`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceFocused : InstanceTypes.ScreenInstanceFocused
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceBlur : InstanceTypes.ScreenInstanceBlur,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeBlurId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeBlur) => {
                            viewModelNodeBlurId = viewModelNodeBlur.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM ${useModelInstance ? InstanceTypes.ModelInstanceBlur : 'Instance'} Blur`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstanceBlur : InstanceTypes.ScreenInstanceBlur
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, !isSharedComponent ? {
                operation: NEW_SCREEN_OPTIONS,
                options: function () {
                    let formLayout = CreateLayout();
                    formLayout = SetCellsLayout(formLayout, 1);
                    let rootCellId = GetFirstCell(formLayout);
                    let cellProperties = GetCellProperties(formLayout, rootCellId);
                    cellProperties.style = { ...cellProperties.style, flexDirection: 'column' };

                    let componentProps = null;

                    if (useModelInstance) {
                        componentProps = createComponentApi();
                        GENERAL_COMPONENT_API.map(x => {
                            componentProps = addComponentApi(componentProps, {
                                modelProp: x.property
                            });
                        });
                        GENERAL_COMPONENT_API.map(t => {
                            let apiProperty = t.property;
                            (function () {
                                let rootCellId = GetFirstCell(formLayout);
                                let cellProperties = GetCellProperties(formLayout, rootCellId);
                                cellProperties.componentApi = cellProperties.componentApi || {};
                                cellProperties.componentApi[apiProperty] = {
                                    instanceType: InstanceTypes.ApiProperty,
                                    apiProperty
                                }
                            })();
                        });
                    }
                    return {
                        callback: (screenOptionNode) => {
                            screenNodeOptionId = screenOptionNode.id;
                        },
                        parent: screenNodeId,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} React Native Form`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.Generic.key,
                            [NodeProperties.ComponentApi]: componentProps,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.Layout]: formLayout,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.ViewType]: viewType,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ScreenOptionsLink }
                        }
                    }
                }
            } : false, isList ? {
                operation: NEW_COMPONENT_NODE,
                options: function (currentGraph) {
                    listLayout = CreateLayout();
                    listLayout = SetCellsLayout(listLayout, 1);
                    let rootCellId = GetFirstCell(listLayout);
                    let cellProperties = GetCellProperties(listLayout, rootCellId);
                    cellProperties.style = { ...cellProperties.style, flexDirection: 'column' };
                    let componentProps = null;

                    let connectto = [];
                    if (isDefaultComponent) {
                        connectto = getViewTypeEndpointsForDefaults(viewType, currentGraph, currentNode.id);
                    }
                    return {
                        callback: (listComponent) => {
                            listComponentId = listComponent.id;
                            connectto.map(ct => {

                                createListConnections.push(function () {
                                    return setSharedComponent({
                                        properties: {
                                            ...LinkProperties.DefaultViewType,
                                            viewType
                                        },
                                        source: ct.id,
                                        target: listComponentId
                                    })(GetDispatchFunc(), GetStateFunc());
                                })
                            });
                        },
                        parent: screenNodeOptionId,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} List RNC`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.SharedComponent]: isSharedComponent,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.List.key,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                            [NodeProperties.Layout]: listLayout,
                            [NodeProperties.ComponentApi]: componentProps
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ComponentLink }
                        }
                    }
                }
            } : false,
            isList ? ({
                operation: NEW_DATA_SOURCE,
                options: function (currentGraph) {
                    return {
                        parent: listComponentId,
                        callback: (dataSource) => {
                            dataSourceId = dataSource.id;
                        },
                        groupProperties: {
                        },
                        properties: {
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                            [NodeProperties.UIType]: GetNodeProp(listComponentId, NodeProperties.UIType, currentGraph),
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.UIText]: `${GetNodeTitle(currentNode)} Data Source`
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.DataSourceLink }
                        }
                    }
                }
            }) : false,
            {
                operation: NEW_COMPONENT_NODE,
                options: function (currentGraph) {
                    layout = CreateLayout();
                    layout = SetCellsLayout(layout, 1);
                    let rootCellId = GetFirstCell(layout);
                    let cellProperties = GetCellProperties(layout, rootCellId);
                    cellProperties.style = { ...cellProperties.style, flexDirection: 'column' };
                    let propertyCount = modelProperties.length + 1;
                    let componentProps = null;

                    layout = SetCellsLayout(layout, propertyCount, rootCellId);
                    let connectto = [];
                    if (isDefaultComponent) {
                        connectto = getViewTypeEndpointsForDefaults(viewType, currentGraph, currentNode.id);
                    }
                    return {
                        callback: (screenComponent) => {
                            screenComponentId = screenComponent.id;
                            connectto.map(ct => {

                                createConnections.push(function () {
                                    return setSharedComponent({
                                        properties: {
                                            ...LinkProperties.DefaultViewType,
                                            viewType
                                        },
                                        source: ct.id,
                                        target: screenComponentId
                                    })(GetDispatchFunc(), GetStateFunc());
                                })
                            });
                        },
                        parent: isList ? listComponentId : screenNodeOptionId,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} RNC`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.SharedComponent]: isSharedComponent,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.ComponentType]: isList ? ComponentTypes.ReactNative.ListItem.key : ComponentTypes.ReactNative.Form.key,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                            [NodeProperties.Layout]: layout,
                            [NodeProperties.ComponentApi]: componentProps
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: isList ? { ...LinkProperties.ListItem } : { ...LinkProperties.ComponentLink }
                        }
                    }
                }
            },

            !isSharedComponent ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (currentGraph) {
                    let formLayout = GetNodeProp(screenNodeOptionId, NodeProperties.Layout, currentGraph);
                    let rootCellId = GetFirstCell(formLayout);
                    let cellProperties = GetCellProperties(formLayout, rootCellId);
                    cellProperties.children[rootCellId] = isList ? listComponentId : screenComponentId;

                    return {
                        prop: NodeProperties.Layout,
                        value: formLayout,
                        id: screenNodeOptionId
                    }
                }
            } : false,

            isList ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (currentGraph) {
                    let formLayout = GetNodeProp(listComponentId, NodeProperties.Layout, currentGraph);
                    let rootCellId = GetFirstCell(formLayout);
                    let cellProperties = GetCellProperties(formLayout, rootCellId);
                    cellProperties.children[rootCellId] = screenComponentId;

                    return {
                        prop: NodeProperties.Layout,
                        value: formLayout,
                        id: listComponentId
                    }
                }
            } : false,
            ...modelProperties.map((modelProperty, modelIndex) => {
                let sharedComponent = GetSharedComponentFor(viewType, modelProperty, currentNode.id);
                if (!sharedComponent) {
                    switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                        case NodeTypes.Model:
                            return {};
                        case NodeTypes.Property:
                            if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                                //if the property is a model reference, it should be a shared component or something.
                                return {};
                            }
                            break;
                    }
                }
                else {
                    childComponents[modelIndex] = sharedComponent;
                    return {};
                }

                return {
                    operation: NEW_COMPONENT_NODE,
                    options: function () {
                        let componentTypeToUse = viewComponentType;

                        //Check if the property has a default view to use for different types of situations

                        return {
                            parent: screenComponentId,
                            groupProperties: {
                            },
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `${GetNodeTitle(modelProperty)} RNC`,
                                [NodeProperties.UIType]: UITypes.ReactNative,
                                [NodeProperties.Label]: GetNodeTitle(modelProperty),
                                [NodeProperties.ComponentType]: sharedComponent || componentTypeToUse,
                                [NodeProperties.UsingSharedComponent]: !!sharedComponent,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.ComponentLink }
                            },
                            callback: (component) => {
                                childComponents[modelIndex] = component.id;
                            }

                        }
                    }
                }
            }),
            ...modelProperties.map((modelProperty, modelIndex) => {
                return {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: function () {
                        let sharedComponent = GetSharedComponentFor(viewType, modelProperty, currentNode.id);
                        if (screenComponentId &&
                            sharedComponent &&
                            !existsLinkBetween(GetCurrentGraph(GetState()), {
                                source: screenComponentId,
                                target: sharedComponent,
                                type: LinkType.SharedComponentInstance
                            })) {

                            return {
                                source: screenComponentId,
                                target: sharedComponent,
                                properties: {
                                    ...LinkProperties.SharedComponentInstance
                                }
                            }
                        }
                    }
                }
            }), {
                operation: NEW_COMPONENT_NODE,
                options: function () {
                    return {
                        parent: screenComponentId,
                        groupProperties: {
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: ` ${Titles.Execute} Button ${viewName} Component`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.Label]: `${viewName} ${Titles.Execute}`,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.Button.key,
                            [NodeProperties.InstanceType]: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ComponentLink }
                        },
                        callback: (component) => {
                            childComponents.push(component.id);
                        }
                    }
                }
            }, {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    let lastComponent = childComponents.length - 1;
                    let rootCellId = GetFirstCell(layout);
                    let children = GetChildren(layout, rootCellId);
                    let childId = children[lastComponent];
                    let cellProperties = GetCellProperties(layout, childId);
                    cellProperties.children[childId] = childComponents[lastComponent];
                    cellProperties.style.flex = null;
                    cellProperties.style.height = null;
                    return {
                        prop: NodeProperties.Layout,
                        id: screenComponentId,
                        value: layout
                    }
                }
            },
            ...modelProperties.map((modelProperty, modelIndex) => {

                return {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function () {
                        let sharedComponent = GetSharedComponentFor(viewType, modelProperty, currentNode.id);
                        if (!sharedComponent) {
                            switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                                case NodeTypes.Model:

                                    return {};
                                case NodeTypes.Property:
                                    if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                                        //if the property is a model reference, it should be a shared component or something.
                                        return {};
                                    }
                                    break;
                            }
                        }

                        let rootCellId = GetFirstCell(layout);
                        let children = GetChildren(layout, rootCellId);
                        let childId = children[modelIndex];
                        let cellProperties = GetCellProperties(layout, childId);
                        cellProperties.children[childId] = sharedComponent || childComponents[modelIndex];
                        cellProperties.style.flex = null;
                        cellProperties.style.height = null;
                        return {
                            prop: NodeProperties.Layout,
                            id: screenComponentId,
                            value: layout
                        }
                    }
                }
            }),
            ...modelProperties.map((modelProperty, modelIndex) => {
                let sharedComponent = GetSharedComponentFor(viewType, modelProperty, currentNode.id);
                if (!sharedComponent) {
                    switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                        case NodeTypes.Model:
                            return {};
                        case NodeTypes.Property:
                            if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                                //if the property is a model reference, it should be a shared component or something.
                                return {};
                            }
                            break;
                    }
                }
                return {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        let componentProps = createComponentApi();
                        let componentTypes = ComponentTypes.ReactNative;
                        let compNodeId = childComponents[modelIndex];
                        let compNode = GetNodeById(compNodeId, graph)
                        let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                        if (!sharedComponent && componentTypes[componentType]) {
                            componentTypes[componentType].defaultApi.map(x => {
                                componentProps = addComponentApi(componentProps, {
                                    modelProp: x.property
                                });
                            });
                        }
                        else if (sharedComponent) {
                            componentProps = {};
                            //     let { instanceType, model, selector, modelProperty, apiProperty, handlerType, isHandler, dataChain } = apiConfig[i];
                            SHARED_COMPONENT_API.map(x => {
                                componentProps[x.property] = {
                                    instanceType: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                                    model: currentNode.id,
                                    modelProperty: modelProperty.id,
                                    handlerType: HandlerTypes.Property
                                }

                            });
                        }
                        else {
                            throw 'sharedComponent should be set'
                        }

                        return {
                            prop: NodeProperties.ComponentApi,
                            id: compNodeId,
                            value: componentProps
                        };
                    }
                }
            }), {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                    let componentProps = createComponentApi();
                    let componentTypes = ComponentTypes.ReactNative;
                    let compNodeId = childComponents[childComponents.length - 1];
                    let compNode = GetNodeById(compNodeId, graph)
                    let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                    componentTypes[componentType].defaultApi.map(x => {
                        componentProps = addComponentApi(componentProps, {
                            modelProp: x.property
                        });
                    });

                    return {
                        prop: NodeProperties.ComponentApi,
                        id: compNodeId,
                        value: componentProps
                    };
                }
            }].filter(x => x))(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([({
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let selectorNode = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.NODEType]: NodeTypes.Selector,
                        [NodeProperties.InstanceType]: useModelInstance
                    }).find(x => x);
                    if (selectorNode) {
                        modelComponentSelectors.push(selectorNode.id);
                        return false;
                    }
                    return {
                        nodeType: NodeTypes.Selector,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${GetNodeTitle(currentNode)}${useModelInstance ? ' Instance' : ''}`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.Pinned]: false,
                            [NodeProperties.InstanceType]: useModelInstance
                        },
                        links: [...vmsIds().map(t => ({
                            target: t,
                            linkProperties: {
                                properties: {
                                    ...LinkProperties.SelectorLink
                                }
                            }
                        }))],
                        callback: (selector) => {
                            modelComponentSelectors.push(selector.id);
                        }
                    }
                }
            })])(GetDispatchFunc(), GetStateFunc());

            let propertyDataChainAccesors = [];

            let datachainLink = [];
            let skipModelDataChainListParts = false;
            let listDataChainId = null;
            let listDataChainExitId = null;
            PerformGraphOperation([
                isList ? {
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        let node = GetNodesByProperties({
                            [NodeProperties.EntryPoint]: true,
                            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Models,
                            [NodeProperties.UIModelType]: currentNode.id,
                        }).find(x => x);
                        if (node) {
                            listDataChainId = node.id;
                            skipModelDataChainListParts = true;
                            return null;
                        }

                        return {
                            callback: (dataChain) => {
                                listDataChainId = dataChain.id;
                            },
                            nodeType: NodeTypes.DataChain,
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `Get ${viewName} Objects`,
                                [NodeProperties.EntryPoint]: true,
                                [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Models,
                                [NodeProperties.UIModelType]: currentNode.id,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.InstanceType]: useModelInstance
                            },
                            links: [{
                                target: currentNode.id,
                                linkProperties: {
                                    properties: {
                                        ...LinkProperties.ModelTypeLink
                                    }
                                }
                            }]
                        }
                    }
                } : false,
                isList ? {
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        if (skipModelDataChainListParts) {
                            return null;
                        }
                        let temp = SplitDataCommand(GetNodeById(listDataChainId, graph), split => {
                            listDataChainExitId = split.id;
                        }, viewPackage);
                        return temp.options;
                    }
                } : false,
                isList ? {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        if (skipModelDataChainListParts) {
                            return null;
                        }
                        return {
                            prop: NodeProperties.DataChainFunctionType,
                            id: listDataChainExitId,
                            value: DataChainFunctionKeys.Pass
                        }
                    }
                } : false,
                isList ? {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        if (skipModelDataChainListParts) {
                            return null;
                        }
                        return {
                            prop: NodeProperties.UIText,
                            id: listDataChainExitId,
                            value: `${GetNodeTitle(currentNode)}s DC Complete`
                        }
                    }
                } : false,
                isList ? {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        if (skipModelDataChainListParts) {
                            return null;
                        }
                        return {
                            prop: NodeProperties.AsOutput,
                            id: listDataChainExitId,
                            value: true
                        }
                    }
                } : false,
                isList ? {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        return {
                            prop: NodeProperties.DataChain,
                            id: dataSourceId,
                            value: listDataChainId
                        }
                    }
                } : false,
                isList ? {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: function (graph) {
                        return {
                            target: listDataChainId,
                            source: dataSourceId,
                            properties: { ...LinkProperties.DataChainLink }
                        }
                    }
                } : false,
                isList ? {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        return {
                            prop: NodeProperties.UIModelType,
                            id: dataSourceId,
                            value: currentNode.id
                        }
                    }
                } : false,
                isList ? {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: function (graph) {
                        return {
                            target: currentNode.id,
                            source: dataSourceId,
                            properties: { ...LinkProperties.ModelTypeLink }
                        }
                    }
                } : false,
            ].filter(x => x))(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([{
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let node = GetNodesByProperties({
                        [NodeProperties.UIText]: `Get ${viewName}`,
                        [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                        [NodeProperties.EntryPoint]: true,
                        [NodeProperties.Selector]: modelComponentSelectors[0],
                        [NodeProperties.SelectorProperty]: viewModelNodeId
                    }).find(x => x);
                    if (node) {
                        return null;
                    }
                    return {
                        nodeType: NodeTypes.DataChain,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `Get ${viewName}`,
                            [NodeProperties.EntryPoint]: true,
                            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                            [NodeProperties.Selector]: modelComponentSelectors[0],
                            [NodeProperties.SelectorProperty]: viewModelNodeId,
                            [NodeProperties.Pinned]: true
                        },
                        links: [{
                            target: modelComponentSelectors[0],
                            linkProperties: {
                                properties: { ...LinkProperties.DataChainLink }
                            }
                        }, {
                            target: viewModelNodeId,
                            linkProperties: {
                                properties: { ...LinkProperties.DataChainLink }
                            }
                        }]
                    }
                }
            }])(GetDispatchFunc(), GetStateFunc());;

            modelProperties.map((modelProperty, propertyIndex) => {
                let propNodeId = null;
                let skip = false;
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:
                        return {};
                    case NodeTypes.Property:
                        if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                            //if the property is a model reference, it should be a shared component or something.
                            return {};
                        }
                        break;
                }
                PerformGraphOperation([{
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        let node = GetNodesByProperties({
                            [NodeProperties.UIText]: `Get ${viewName} Object => ${GetNodeTitle(modelProperty)}`,
                            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                            [NodeProperties.EntryPoint]: true,
                            [NodeProperties.Selector]: modelComponentSelectors[0],
                            [NodeProperties.SelectorProperty]: viewModelNodeId,
                            [NodeProperties.Property]: modelProperty.id
                        }).find(x => x);
                        if (node) {
                            propNodeId = node.id;
                            skip = true;
                            propertyDataChainAccesors.push(propNodeId);
                            return null;
                        }
                        return {
                            nodeType: NodeTypes.DataChain,
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `Get ${viewName} Object => ${GetNodeTitle(modelProperty)}`,
                                [NodeProperties.EntryPoint]: true,
                                [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                                [NodeProperties.Selector]: modelComponentSelectors[0],
                                [NodeProperties.SelectorProperty]: viewModelNodeId,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.Property]: modelProperty.id
                            },
                            links: [{
                                target: modelComponentSelectors[0],
                                linkProperties: {
                                    properties: { ...LinkProperties.DataChainLink }
                                }
                            }, {
                                target: viewModelNodeId,
                                linkProperties: {
                                    properties: { ...LinkProperties.DataChainLink }
                                }
                            }],
                            callback: (propNode) => {
                                propNodeId = propNode.id;
                                propertyDataChainAccesors.push(propNodeId);
                            }
                        }
                    }
                }, {
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        if (skip) {
                            return {};
                        }
                        return {
                            parent: propNodeId,
                            nodeType: NodeTypes.DataChain,
                            groupProperties: {
                                [GroupProperties.ExternalEntryNode]: GetNodeProp(GetNodeById(propNodeId), NodeProperties.ChainParent),
                                [GroupProperties.GroupEntryNode]: propNodeId,
                                [GroupProperties.GroupExitNode]: propNodeId,
                                [GroupProperties.ExternalExitNode]: GetDataChainNextId(propNodeId)
                            },
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `Get ${GetNodeTitle(modelProperty)}`,
                                [NodeProperties.ChainParent]: propNodeId,
                                [NodeProperties.AsOutput]: true,
                                [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Property,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.UIModelType]: currentNode.id,
                                [NodeProperties.Property]: modelProperty.id
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.DataChainLink }
                            },
                            links: [{
                                target: currentNode.id,
                                linkProperties: {
                                    properties: { ...LinkProperties.ModelTypeLink }
                                }
                            }, {
                                target: modelProperty.id,
                                linkProperties: {
                                    properties: { ...LinkProperties.PropertyLink }
                                }
                            }],
                            callback: (node, graph) => {

                            }
                        }
                    }
                }].filter(x => x))(GetDispatchFunc(), GetStateFunc());;

                let compNodeId = childComponents[propertyIndex];

                let compNode = GetNodeById(compNodeId)
                let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                let componentApi = GetNodeProp(compNode, NodeProperties.ComponentApi);

                let rootCellId = GetFirstCell(layout);
                let children = GetChildren(layout, rootCellId);
                let childId = children[propertyIndex];
                let apiList = getComponentApiList(componentApi);
                let apiDataChainLists = {};
                PerformGraphOperation([...apiList.map(api => {
                    let apiProperty = api.value;
                    if (ARE_BOOLEANS.some(v => v === apiProperty) || ARE_HANDLERS.some(v => v === apiProperty)) {
                        return false;
                    }
                    let dca = null;
                    let completeId = null;
                    let splitId = null;
                    return [{
                        operation: ADD_NEW_NODE,
                        options: function (graph) {
                            return {
                                nodeType: NodeTypes.DataChain,
                                properties: {
                                    ...viewPackage,
                                    [NodeProperties.UIText]: `${viewName} ${GetNodeTitle(modelProperty)} ${apiProperty}`,
                                    [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
                                    [NodeProperties.Pinned]: false,
                                    [NodeProperties.EntryPoint]: true
                                },
                                links: [],
                                callback: (dataChainApis) => {
                                    dca = dataChainApis.id;
                                    apiDataChainLists[apiProperty] = (dataChainApis.id);
                                }
                            }
                        }
                    }, {
                        operation: ADD_NEW_NODE,
                        options: function (graph) {
                            let temp = SplitDataCommand(GetNodeById(dca, graph), split => {
                                splitId = split.id;
                            }, viewPackage);
                            return temp.options;
                        }
                    }, {
                        operation: ADD_NEW_NODE,
                        options: function (graph) {

                            let temp = AddChainCommand(GetNodeById(splitId, graph), complete => {
                                completeId = complete.id;
                            }, graph, viewPackage);
                            return temp.options;
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainFunctionType,
                                id: completeId,
                                value: DataChainFunctionKeys.Pass
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.UIText,
                                id: completeId,
                                value: `${apiProperty} Complete`
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.AsOutput,
                                id: completeId,
                                value: true
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainFunctionType,
                                id: splitId,
                                value: DataChainFunctionKeys.ReferenceDataChain
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.UIText,
                                id: splitId,
                                value: `${GetNodeTitle(modelProperty)} ${apiProperty}`
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainReference,
                                id: splitId,
                                value: propNodeId
                            }
                        }
                    }, {
                        operation: ADD_LINK_BETWEEN_NODES,
                        options: function (graph) {
                            return {
                                source: splitId,
                                target: propNodeId,
                                properties: { ...LinkProperties.DataChainLink }
                            }
                        }
                    }]
                }).flatten().filter(x => x)])(GetDispatchFunc(), GetStateFunc());
                PerformGraphOperation([...apiList.map(api => {
                    return {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            let apiProperty = api.value;
                            let cellProperties = GetCellProperties(layout, childId);
                            cellProperties.componentApi = cellProperties.componentApi || {};
                            // let { instanceType, model, selector, handlerType, dataChain, modelProperty } = cellProperties.componentApi[apiProperty] || {};
                            if (ARE_BOOLEANS.some(v => v === apiProperty)) {
                                cellProperties.componentApi[apiProperty] = {
                                    instanceType: InstanceTypes.Boolean,
                                    handlerType: HandlerTypes.Property,
                                }
                            }
                            else if (ARE_HANDLERS.some(v => v === apiProperty)) {
                                if ([ARE_TEXT_CHANGE].some(v => v === apiProperty)) {
                                    cellProperties.componentApi[apiProperty] = {
                                        instanceType: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                                        handlerType: HandlerTypes.ChangeText
                                    };
                                }
                                else {
                                    cellProperties.componentApi[apiProperty] = {
                                        instanceType: useModelInstance ? InstanceTypes.ModelInstance : InstanceTypes.ScreenInstance,
                                        handlerType: HandlerTypes.Change,
                                    }
                                }
                            }
                            else {
                                cellProperties.componentApi[apiProperty] = {
                                    instanceType: useModelInstance ? InstanceTypes.SelectorInstance : InstanceTypes.Selector,
                                    selector: modelComponentSelectors[0],
                                    handlerType: HandlerTypes.Property,
                                    dataChain: apiDataChainLists[apiProperty]// propertyDataChainAccesors[propertyIndex]
                                }
                                if (apiDataChainLists[apiProperty]) {
                                    datachainLink.push({
                                        operation: ADD_LINK_BETWEEN_NODES,
                                        options: function () {
                                            return {
                                                target: modelComponentSelectors[0],
                                                source: compNodeId,
                                                linkProperties: {
                                                    ...LinkProperties.SelectorLink
                                                }
                                            }
                                        }
                                    })
                                }
                            }

                            if (apiProperty === VALUE) {
                                cellProperties.componentApi[apiProperty].dataChain = apiDataChainLists[apiProperty];//propertyDataChainAccesors[propertyIndex];
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: propertyDataChainAccesors[propertyIndex],
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.DataChainLink,
                                                cell: childId,
                                                selectedComponentApiProperty: apiProperty
                                            }
                                        }
                                    }
                                })

                            }

                            switch (apiProperty) {
                                case ON_BLUR:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeBlurId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Blur;
                                    break;
                                case ON_CHANGE_TEXT:
                                case ON_CHANGE:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    break;
                                case ON_FOCUS:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeFocusId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Focus;
                                    break;
                            }
                            if (cellProperties.componentApi[apiProperty].modelProperty) {
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: cellProperties.componentApi[apiProperty].modelProperty,
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.ComponentApi,
                                                modelProperty: true
                                            }
                                        }
                                    }
                                })
                            }

                            if (cellProperties.componentApi[apiProperty].model) {
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: cellProperties.componentApi[apiProperty].model,
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.ComponentApi,
                                                model: true
                                            }
                                        }
                                    }
                                })
                            }

                            return {
                                prop: NodeProperties.Layout,
                                id: screenComponentId,
                                value: layout
                            }
                        }
                    }
                })])(GetDispatchFunc(), GetStateFunc());
            });

            PerformGraphOperation(datachainLink)(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([
                ...([].interpolate(0, modelProperties.length + 1, modelIndex => {
                    return applyDefaultComponentProperties(GetNodeById(childComponents[modelIndex]), UITypes.ReactNative)

                })).flatten(),

                applyDefaultComponentProperties(GetNodeById(screenComponentId), UITypes.ReactNative),
                applyDefaultComponentProperties(GetNodeById(screenNodeOptionId), UITypes.ReactNative)
            ])(GetDispatchFunc(), GetStateFunc());
            createConnections.map(t => t());
            createListConnections.map(t => t());
        }
    }
};


export function applyDefaultComponentProperties(currentNode, _ui_type) {
    // var { state } = this.props;
    // var currentNode = Node(state, Visual(state, SELECTED_NODE));
    // let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
    // let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
    let result = [];
    if (currentNode) {
        let componentTypes = ComponentTypes[_ui_type] || {};
        let componentType = GetNodeProp(currentNode, NodeProperties.ComponentType);
        Object.keys(componentTypes[componentType] ? componentTypes[componentType].properties : {}).map(key => {
            let prop_obj = componentTypes[componentType].properties[key];
            if (prop_obj.parameterConfig) {
                let selectedComponentApiProperty = key;
                let componentProperties = GetNodeProp(currentNode, prop_obj.nodeProperty);
                componentProperties = componentProperties || {};
                componentProperties[selectedComponentApiProperty] = componentProperties[selectedComponentApiProperty] || {};
                componentProperties[selectedComponentApiProperty] = {
                    instanceType: InstanceTypes.ApiProperty,
                    isHandler: prop_obj.isHandler,
                    apiProperty: prop_obj.nodeProperty
                };

                result.push({
                    operation: CHANGE_NODE_PROPERTY,
                    options: {
                        prop: prop_obj.nodeProperty,
                        id: currentNode.id,
                        value: componentProperties
                    }
                });
            }
        });
    }

    return result;
}

function CreateFunction(option) {
    let {
        nodePackageType,
        methodType,
        httpMethod,
        functionType,
        functionName
    } = option;
    if (!nodePackageType) {
        throw 'missing node package type';
    }
    if (!methodType) {
        throw 'missing method type';
    }
    if (!httpMethod) {
        throw 'missing http method';
    }
    if (!functionType) {
        throw 'function type missing';
    }
    if (!functionName) {
        throw 'function name is missing';
    }
    return (args) => {
        let { model, dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
        let agents = GetAgentNodes();

        agents.filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController)).map(agent => {
            let methodProps;

            if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
                let outer_commands = [{
                    operation: ADD_NEW_NODE,
                    options: {
                        nodeType: NodeTypes.Method,
                        parent: model.id,
                        groupProperties: {
                        },
                        properties: {
                            [NodeProperties.NodePackage]: model.id,
                            [NodeProperties.NodePackageType]: nodePackageType,
                            [NodeProperties.NodePackageAgent]: agent.id,
                            [NodeProperties.FunctionType]: functionType,
                            [NodeProperties.MethodType]: methodType,
                            [NodeProperties.HttpMethod]: httpMethod,
                            [NodeProperties.UIText]: `${GetNodeTitle(model)} ${functionName}`
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.FunctionOperator }
                        },
                        callback: (methodNode) => {
                            setTimeout(() => {
                                new Promise((resolve) => {

                                    let { constraints } = MethodFunctions[functionType];
                                    let commands = [];
                                    let permissionNode = null;
                                    Object.values(constraints).map(constraint => {
                                        switch (constraint.key) {
                                            case FunctionTemplateKeys.Model:
                                            case FunctionTemplateKeys.Agent:
                                            case FunctionTemplateKeys.User:
                                            case FunctionTemplateKeys.ModelOutput:
                                                methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                if (constraint[NodeProperties.IsAgent]) {
                                                    methodProps[constraint.key] = agent.id;
                                                }
                                                else if (constraint.key === FunctionTemplateKeys.User) {
                                                    methodProps[constraint.key] = GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
                                                }
                                                else {
                                                    methodProps[constraint.key] = model.id;
                                                }
                                                break;
                                            case FunctionTemplateKeys.Permission:
                                            case FunctionTemplateKeys.ModelFilter:
                                                let perOrModelNode = null;
                                                PerformGraphOperation([({
                                                    operation: ADD_NEW_NODE,
                                                    options: {
                                                        parent: methodNode.id,
                                                        nodeType: constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter,
                                                        groupProperties: {
                                                        },
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} ${constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter}`
                                                        },
                                                        linkProperties: {
                                                            properties: { ...LinkProperties.FunctionOperator }
                                                        },
                                                        callback: (newNode) => {
                                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                            methodProps[constraint.key] = newNode.id;
                                                            perOrModelNode = newNode;
                                                        }
                                                    }
                                                })])(dispatch, getState);
                                                if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                                                    commands = [...commands, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterAgent,
                                                            id: perOrModelNode.id,
                                                            value: agent.id
                                                        }
                                                    }, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterModel,
                                                            id: perOrModelNode.id,
                                                            value: model.id
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: model.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.ModelTypeLink }
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: agent.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.AgentTypeLink }
                                                        }
                                                    }]
                                                }
                                                break;
                                        }
                                        commands = [...commands, ...[{
                                            operation: CHANGE_NODE_PROPERTY,
                                            options: {
                                                prop: NodeProperties.MethodProps,
                                                id: methodNode.id,
                                                value: methodProps
                                            }
                                        }, {
                                            operation: ADD_LINK_BETWEEN_NODES,
                                            options: {
                                                target: methodProps[constraint.key],
                                                source: methodNode.id,
                                                properties: { ...LinkProperties.FunctionOperator }
                                            }
                                        }]];
                                    })
                                    if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType, NodeTypes.Controller)) {
                                        commands.push({
                                            operation: ADD_NEW_NODE,
                                            options: {
                                                nodeType: NodeTypes.Controller,
                                                properties: {
                                                    [NodeProperties.NodePackage]: model.id,
                                                    [NodeProperties.NodePackageType]: nodePackageType,
                                                    [NodeProperties.NodePackageAgent]: agent.id,
                                                    [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Controller`
                                                },
                                                linkProperties: {
                                                    properties: { ...LinkProperties.FunctionOperator }
                                                },
                                                callback: (controllerNode) => {
                                                    setTimeout(() => {
                                                        if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType, NodeTypes.Maestro)) {
                                                            PerformGraphOperation([{
                                                                operation: ADD_NEW_NODE,
                                                                options: {
                                                                    nodeType: NodeTypes.Maestro,
                                                                    parent: controllerNode.id,

                                                                    properties: {
                                                                        [NodeProperties.NodePackage]: model.id,
                                                                        [NodeProperties.NodePackageType]: nodePackageType,
                                                                        [NodeProperties.NodePackageAgent]: agent.id,
                                                                        [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Maestro`
                                                                    },
                                                                    linkProperties: {
                                                                        properties: { ...LinkProperties.MaestroLink }
                                                                    },
                                                                    callback: (maestroNode) => {
                                                                        setTimeout(() => {
                                                                            PerformGraphOperation([{
                                                                                operation: ADD_LINK_BETWEEN_NODES,
                                                                                options: {
                                                                                    target: methodNode.id,
                                                                                    source: maestroNode.id,
                                                                                    properties: {
                                                                                        ...LinkProperties.FunctionLink
                                                                                    }
                                                                                }
                                                                            }])(dispatch, getState);

                                                                        }, 1500)
                                                                    }
                                                                }
                                                            }])(dispatch, getState)
                                                        }

                                                    }, 1500)
                                                }
                                            }
                                        });
                                    }
                                    PerformGraphOperation(commands)(dispatch, getState)
                                    resolve();
                                })
                            }, 1500)
                        }
                    }
                }]
                PerformGraphOperation(outer_commands)(dispatch, getState);
            }
        });
    }
}


export function CreateAgentFunction(option) {
    let {
        nodePackageType,
        methodType,
        maestroNodeId,
        parentId: parent,
        httpMethod,
        functionType,
        functionName,
        model,
        agent
    } = option;

    if (!nodePackageType) {
        throw 'missing node package type';
    }
    if (!methodType) {
        throw 'missing method type';
    }
    if (!httpMethod) {
        throw 'missing http method';
    }
    if (!functionType) {
        throw 'function type missing';
    }
    if (!functionName) {
        throw 'function name is missing';
    }
    return (args) => {
        let { dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);

        let methodProps;

        if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
            let outer_commands = [{
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.Method,
                    groupProperties: {
                    },
                    properties: {
                        [NodeProperties.NodePackage]: model.id,
                        [NodeProperties.NodePackageType]: nodePackageType,
                        [NodeProperties.NodePackageAgent]: agent.id,
                        [NodeProperties.FunctionType]: functionType,
                        [NodeProperties.MethodType]: methodType,
                        [NodeProperties.HttpMethod]: httpMethod,
                        [NodeProperties.UIText]: `${GetNodeTitle(model)} ${functionName}`
                    },
                    linkProperties: {
                        properties: { ...LinkProperties.FunctionOperator }
                    },
                    callback: (methodNode) => {
                        setTimeout(() => {
                            new Promise((resolve) => {

                                let { constraints } = MethodFunctions[functionType];
                                let commands = [];
                                let permissionNode = null;
                                Object.values(constraints).map(constraint => {
                                    switch (constraint.key) {
                                        case FunctionTemplateKeys.Model:
                                        case FunctionTemplateKeys.ModelOutput:
                                        case FunctionTemplateKeys.Agent:
                                        case FunctionTemplateKeys.Parent:
                                        case FunctionTemplateKeys.User:
                                        case FunctionTemplateKeys.ModelOutput:
                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                            if (constraint[NodeProperties.IsAgent]) {
                                                methodProps[constraint.key] = agent.id;
                                            }
                                            else if (constraint.key === FunctionTemplateKeys.User) {
                                                methodProps[constraint.key] = GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
                                            }
                                            else if (constraint.key === FunctionTemplateKeys.Parent) {
                                                methodProps[constraint.key] = parent.id;
                                            }
                                            else {
                                                methodProps[constraint.key] = model.id;
                                            }
                                            break;
                                        case FunctionTemplateKeys.Validator:
                                            let validator = null;
                                            PerformGraphOperation([{
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
                                                        parent: methodNode.id,
                                                        nodeType: NodeTypes.Validator,
                                                        groupProperties: {},
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.Collapsed]: true,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} Validator`,
                                                            [NodeProperties.ValidatorModel]: model.id,
                                                            [NodeProperties.ValidatorAgent]: agent.id,
                                                            [NodeProperties.ValidatorFunction]: methodNode.id
                                                        },
                                                        callback: (_node) => {
                                                            methodProps[constraint.key] = _node.id;
                                                            validator = _node;
                                                        }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: model.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorModelLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: agent.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorAgentLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: methodNode.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorFunctionLink }
                                                    }
                                                }
                                            }])(GetDispatchFunc(), GetStateFunc());
                                            break;
                                        case FunctionTemplateKeys.Executor:
                                            let executor = null;
                                            PerformGraphOperation([{
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
                                                        parent: methodNode.id,
                                                        nodeType: NodeTypes.Executor,
                                                        groupProperties: {},
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.ExecutorFunctionType]: methodType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} Executor`,
                                                            [NodeProperties.ExecutorModel]: model.id,
                                                            [NodeProperties.ExecutorModelOutput]: model.id,
                                                            [NodeProperties.ExecutorFunction]: methodNode.id,
                                                            [NodeProperties.ExecutorAgent]: agent.id,
                                                        },
                                                        callback: (_node) => {
                                                            methodProps[constraint.key] = _node.id;
                                                            executor = _node;
                                                        }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: model.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorModelLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: agent.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorAgentLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: methodNode.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorFunctionLink }
                                                    }
                                                }
                                            }])(GetDispatchFunc(), GetStateFunc());
                                            break;
                                        case FunctionTemplateKeys.Permission:
                                        case FunctionTemplateKeys.ModelFilter:
                                            let perOrModelNode = null;
                                            PerformGraphOperation([({
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
                                                        parent: methodNode.id,
                                                        nodeType: constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter,
                                                        groupProperties: {
                                                        },
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} ${constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter}`
                                                        },
                                                        linkProperties: {
                                                            properties: { ...LinkProperties.FunctionOperator }
                                                        },
                                                        callback: (newNode) => {
                                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                            methodProps[constraint.key] = newNode.id;
                                                            perOrModelNode = newNode;
                                                        }
                                                    }
                                                }
                                            })])(GetDispatchFunc(), GetStateFunc());
                                            if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                                                commands = [...commands, {
                                                    operation: CHANGE_NODE_PROPERTY,
                                                    options: {
                                                        prop: NodeProperties.FilterAgent,
                                                        id: perOrModelNode.id,
                                                        value: agent.id
                                                    }
                                                }, {
                                                    operation: CHANGE_NODE_PROPERTY,
                                                    options: {
                                                        prop: NodeProperties.FilterModel,
                                                        id: perOrModelNode.id,
                                                        value: model.id
                                                    }
                                                }, {
                                                    operation: ADD_LINK_BETWEEN_NODES,
                                                    options: {
                                                        target: model.id,
                                                        source: perOrModelNode.id,
                                                        properties: { ...LinkProperties.ModelTypeLink }
                                                    }
                                                }, {
                                                    operation: ADD_LINK_BETWEEN_NODES,
                                                    options: {
                                                        target: agent.id,
                                                        source: perOrModelNode.id,
                                                        properties: { ...LinkProperties.AgentTypeLink }
                                                    }
                                                }]
                                            }
                                            break;
                                    }
                                    commands = [...commands, ...[{
                                        operation: CHANGE_NODE_PROPERTY,
                                        options: {
                                            prop: NodeProperties.MethodProps,
                                            id: methodNode.id,
                                            value: methodProps
                                        }
                                    }, {
                                        operation: ADD_LINK_BETWEEN_NODES,
                                        options: {
                                            target: methodProps[constraint.key],
                                            source: methodNode.id,
                                            properties: { ...LinkProperties.FunctionOperator }
                                        }
                                    }]];
                                })

                                PerformGraphOperation(commands)(dispatch, getState);
                                setTimeout(() => {

                                    updateMethodParameters(methodNode.id, functionType)(dispatch, getState);
                                }, 1000);
                                resolve();
                            })
                        }, 1500)
                    }
                }
            }]
            PerformGraphOperation(outer_commands)(dispatch, getState);
        }

    }
}

function GetSharedComponentFor(viewType, modelProperty, currentNodeId) {
    let graph = GetCurrentGraph(GetState());
    let viewTypeNodes = GetNodesLinkedTo(graph, {
        id: modelProperty.id
    });
    viewTypeNodes = viewTypeNodes.filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ViewType);
    viewTypeNodes = viewTypeNodes.find(x => {
        if (existsLinkBetween(graph, {
            source: x.id,
            target: currentNodeId,
            type: LinkType.DefaultViewType
        })) {
            let link = findLink(graph, { source: x.id, target: currentNodeId });
            if (GetLinkProperty(link, LinkPropertyKeys.ViewType) === viewType) {
                return true;
            }
        }
        return false;
    });
    if (viewTypeNodes) {
        return viewTypeNodes.id;
    }
    switch (viewType) {
        case ViewTypes.Get:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGet);
        case ViewTypes.Create:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeCreate);
        case ViewTypes.Delete:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeDelete);
        case ViewTypes.GetAll:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGetAll);
        case ViewTypes.Update:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeUpdate);
    }
}