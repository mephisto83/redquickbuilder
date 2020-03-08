import {
  GetValidationNode,
  GetCombinedCondition,
  GetNodeById,
  GetNodeProp
} from "../actions/uiactions";
import { ProgrammingLanguages, NodeProperties } from "../constants/nodetypes";

export function buildValidation(args = { methodMethod }) {
  let { methodMethod, id } = args;
  if (methodMethod) {
    let dataChain = GetNodeById(id);
    let property = GetNodeProp(dataChain, NodeProperties.Property);
    let validationNode = GetValidationNode(methodMethod);
    let conditions = null;
    if (validationNode) {
      conditions = GetCombinedCondition(
        validationNode.id,
        ProgrammingLanguages.JavaScript,
        { filter: { property } }
      );
    }
    return `context => {
      let result = {
        errors: [],
        warnings: [],
        success: [],
        valid: true
      };
      let { object, property } = context;
      let model = object;

      ${conditions || ""};

      return result;
    }`;
  }
}
