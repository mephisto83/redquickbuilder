import { InstanceTypeSelectorFunction } from "../constants/componenttypes";
import {
  NodesByType,
  GetState,
  GetNodeProp,
  GetJSCodeName,
  GetCurrentGraph,
  GetCodeName
} from "../actions/uiactions";
import { NodeTypes, NEW_LINE, NodeProperties } from "../constants/nodetypes";
import { addNewLine } from "../utils/array";
import { GetNodesLinkedTo } from "../methods/graph_methods";

export default class ListsGenerator {
  static Generate(options) {
    let { state } = options;
    let lists = NodesByType(state, NodeTypes.Lists);
    let graph = GetCurrentGraph(state);
    let template = lists
      .map(list => {
        let connected = GetNodesLinkedTo(graph, {
          id: list.id
        }).map(v => {
          return GetCodeName(v);
        });
        return `export const ${GetCodeName(list)} = ${JSON.stringify(
          connected
        )};`;
      })
      .join(NEW_LINE);
    let temps = [
      {
        template: template,
        relative: "./src/actions",
        relativeFilePath: `./lists.js`,
        name: "lists"
      }
    ];

    let result = {};

    temps.map(t => {
      result[t.name] = t;
    });

    return result;
  }
}
