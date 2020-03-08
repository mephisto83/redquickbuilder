import { GetNodesLinkedTo, GetAllChildren } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  GetModelPropertyChildren,
  ViewTypes,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeById,
  GetNodeTitle,
  ComponentApiKeys,
  GetModelPropertyNodes,
  LinkProperties,
  ADD_LINK_BETWEEN_NODES
} from "../../actions/uiactions";
import { LinkType, NodeProperties } from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import AppendValidations from "./AppendValidations";

export default function ScreenConnectCreate(args = { method, node }) {
  let { node, method, viewType } = args;
  if (!node) {
    throw "no node";
  }
  if (!method) {
    throw "no method";
  }
  let graph = GetCurrentGraph();
  let screen_options = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ScreenOptions
  });
  let result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  screen_options.map(screen_option => {
    let components = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.Component
    });
    components.map(component => {
      let subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      });
      let executeButtons = subcomponents.filter(x =>
        GetNodeProp(x, NodeProperties.ExecuteButton)
      );

      if (executeButtons.length === 1) {
        // There should be only 1 execute button
        let executeButton = executeButtons[0];

        let onEvents = GetNodesLinkedTo(graph, {
          id: executeButton.id,
          link: LinkType.EventMethod
        }).filter(x =>
          [ComponentEvents.onClick, ComponentEvents.onPress].some(
            v => v === GetNodeProp(x, NodeProperties.EventType)
          )
        );
        onEvents.filter(x => {
          let t = GetNodesLinkedTo(graph, {
            id: x.id,
            link: LinkType.EventMethodInstance
          });
          if (t && t.length) {
            t.map(instance => {
              let vp = GetNodeProp(instance, NodeProperties.ViewPackage);
              if (vp) {
                let inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: vp
                });
                inPackageNodes.map(inPackageNode => {
                  result.push({
                    operation: REMOVE_NODE,
                    options: function(graph) {
                      return {
                        id: inPackageNode.id
                      };
                    }
                  });
                });
              }
            });
          }
          let _instanceNode = null;
          result.push(
            ...[
              {
                operation: ADD_NEW_NODE,
                options: addInstanceFunc(
                  x,
                  instanceNode => {
                    _instanceNode = instanceNode;
                  },
                  viewPackages
                )
              }
            ],
            function(graph) {
              if (_instanceNode) {
                return ConnectLifecycleMethod({
                  target: method,
                  source: _instanceNode.id,
                  graph,
                  viewPackages
                });
              }
              return [];
            }
          );
        });
      }

      result.push(
        ...AppendValidations({
          subcomponents,
          screen_option,
          method,
          viewPackages
        })
      );
    });
  });

  return result;
}
