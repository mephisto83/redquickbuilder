import {
  NodesByType,
  GetCurrentGraph,
  GetCodeName
} from "../actions/uiactions";
import { NodeTypes, NEW_LINE, UITypes } from "../constants/nodetypes";
import { GetNodesLinkedTo } from "../methods/graph_methods";

export default class ListsGenerator {
  static Generate(options) {
    const { state, language } = options;
    const lists = NodesByType(state, NodeTypes.Lists);
    const graph = GetCurrentGraph(state);
    let fileEnding = '.ts';
    if (language === UITypes.ReactNative) {
      fileEnding = '.js';
    }
    let template = lists
      .map(list => {
        const connected = GetNodesLinkedTo(graph, {
          id: list.id
        }).map(v => GetCodeName(v));
        return `export const ${GetCodeName(list)} = ${JSON.stringify(
          connected
        )};`;
      })
      .join(NEW_LINE);
    if (!template) {
      template = 'export default {};'
    }
    const temps = [
      {
        template,
        relative: "./src/actions",
        relativeFilePath: `./lists${fileEnding}`,
        name: "lists"
      }
    ];

    const result = {};

    temps.forEach(t => {
      result[t.name] = t;
    });

    return result;
  }
}
