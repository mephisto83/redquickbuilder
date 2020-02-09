import { InstanceTypeSelectorFunction } from "../constants/componenttypes";
import {
  NodesByType,
  GetState,
  GetNodeProp,
  GetJSCodeName,
  GetSelectorsNodes
} from "../actions/uiactions";
import {
  NodeTypes,
  NEW_LINE,
  NodeProperties,
  SelectorType
} from "../constants/nodetypes";
import { addNewLine } from "../utils/array";

export default class SelectorGenerator {
  static Generate(options) {
    let funcs = GenerateSelectorFunctions();
    let temps = [
      {
        template: `import * as UIA from './uiActions';
${funcs.join(NEW_LINE)}`,
        relative: "./src/actions",
        relativeFilePath: `./selector.js`,
        name: "selector"
      }
    ];

    let result = {};

    temps.map(t => {
      result[t.name] = t;
    });

    return result;
  }
}

export function GenerateSelectorFunctions() {
  let nodes = NodesByType(GetState(), NodeTypes.Selector);

  return nodes
    .map(node => {
      return GenerateSelectorFunction(node);
    })
    .unique();
}
export function GenerateSelectorFunction(node) {
  let result = null;
  let selectType = GetNodeProp(node, NodeProperties.SelectorType);
  switch (selectType) {
    case SelectorType.InternalProperties:
      return `export function ${GetJSCodeName(node)}(state) {
        let { value, viewModel } = state;
        return {
          value,
          viewModel
        }
      }`
  }
  result = `
export function ${GetJSCodeName(node)}(value, viewModel, options = {}) {
    if(options){
      if(options.update){
        return  {
          dirty:UIA.GetScreenModelDirtyInstance(value, viewModel),
          focus:UIA.GetScreenModelFocusInstance(value, viewModel),
          blur: UIA.GetScreenModelBlurInstance(value, viewModel),
          focused:UIA.GetScreenModelFocusedInstance(value, viewModel),
          object:UIA.GetScreenModelInstance(value, viewModel)
        }
      }
    }
    return {
        dirty: value
            ? UIA.GetModelInstanceDirtyObject(value, viewModel)
            : UIA.GetScreenInstanceDirtyObject(viewModel),
        focus: value
            ? UIA.GetModelInstanceFocusObject(value, viewModel)
            : UIA.GetScreenInstanceFocusObject(viewModel),
        blur: value
            ? UIA.GetModelInstanceBlurObject(value, viewModel)
            : UIA.GetScreenInstanceBlurObject(viewModel),
        focused: value
            ? UIA.GetModelInstanceFocusedObject(value, viewModel)
            : UIA.GetScreenInstanceFocusedObject(viewModel),
        object: value
            ? UIA.GetModelInstanceObject(value, viewModel)
            : UIA.GetScreenInstanceObject(viewModel)
    }
}
`;
  return result;
}
