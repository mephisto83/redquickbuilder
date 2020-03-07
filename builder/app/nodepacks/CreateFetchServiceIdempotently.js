import { uuidv4 } from "../utils/array";
import { NodeProperties, NodeTypes } from "../constants/nodetypes";
import {
  GetCurrentGraph,
  GetNodeByProperties,
  ADD_NEW_NODE,
  GetNodeById,
  NodesByType,
  GetMethodPropNode,
  GetNodeProp,
  ADD_LINK_BETWEEN_NODES,
  LinkProperties,
  GetMethodNodeProp,
  REMOVE_LINK_BETWEEN_NODES,
  UPDATE_NODE_PROPERTY
} from "../actions/uiactions";
import CreateFetchParameters from "./CreateFetchParameters";
import CreateFetchService from "./CreateFetchService";
import CreateFetchOutput from './CreateFetchOutput';
import {
  MethodFunctions,
  FunctionTemplateKeys
} from "../constants/functiontypes";
import CreatePropertiesForFetch from "./CreatePropertiesForFetch";
export default function(args = {}) {
  //
  let result = [];
  let context = {
    ...args
  };

  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  let graph = GetCurrentGraph();
  let fetchParameter = GetNodeByProperties(
    {
      [NodeProperties.IsFetchParameter]: true
    },
    graph
  );
  let fetchOutput = GetNodeByProperties(
    {
      [NodeProperties.IsFetchOutput]: true
    },
    graph
  );
  let fetchCompatibleMethods = NodesByType(null, NodeTypes.Method).filter(
    method => {
      let funcType = GetNodeProp(method, NodeProperties.FunctionType);
      let { isFetchCompatible } =
        funcType && MethodFunctions[funcType] ? MethodFunctions[funcType] : {};
      return isFetchCompatible;
    }
  );
  let fetchService = GetNodeByProperties({
    [NodeProperties.NODEType]: NodeTypes.FetchService
  });

  if (!fetchParameter) {
    result.push(
      ...CreateFetchParameters({
        callback: context => {
          fetchParameter = GetNodeById(context.entry, graph);
        }
      })
    );
  }
  if (!fetchOutput) {
    result.push(
      ...CreateFetchOutput({
        callback: context => {
          fetchOutput = GetNodeById(context.entry, graph);
        }
      })
    );
  }
  if (!fetchService) {
    result.push(
      ...CreateFetchService({
        callback: context => {
          fetchService = GetNodeById(context.entry, graph);
        }
      })
    );
  }
  fetchCompatibleMethods.map(fetchMethod => {
    result.push({
      operation: ADD_LINK_BETWEEN_NODES,
      options: function() {
        return {
          target: fetchMethod.id,
          source: fetchService.id,
          properties: { ...LinkProperties.FetchService }
        };
      }
    });

    let param = GetMethodNodeProp(
      fetchMethod,
      FunctionTemplateKeys.FetchParameter
    );
    if (param !== fetchParameter.id) {
      let methodProps = {
        ...(GetNodeProp(fetchMethod, NodeProperties.MethodProps) || {})
      };
      methodProps[FunctionTemplateKeys.FetchParameter] = fetchParameter.id;
      result.push(
        {
          operation: REMOVE_LINK_BETWEEN_NODES,
          options: {
            source: fetchMethod.id,
            target: param
          }
        },
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options: {
            source: fetchMethod.id,
            target: fetchParameter.id,
            properties: { ...LinkProperties.FunctionOperator }
          }
        },
        {
          operation: UPDATE_NODE_PROPERTY,
          options: function() {
            return {
              id: fetchMethod.id,
              properties: { [NodeProperties.MethodProps]: methodProps }
            };
          }
        }
      );
    }
  });

  result.push({
    operation: ADD_LINK_BETWEEN_NODES,
    options: function() {
      return {
        target: fetchOutput.id,
        source: fetchService.id,
        properties: { ...LinkProperties.FetchServiceOuput }
      };
    }
  });
  result.push(function() {
    return CreatePropertiesForFetch({
      id: fetchOutput.id
    });
  });
  return result;
}