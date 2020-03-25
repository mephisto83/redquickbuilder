/* eslint-disable import/prefer-default-export */
/* eslint-disable prefer-const */
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
    const dataChain = GetNodeById(id);
    const property = GetNodeProp(dataChain, NodeProperties.Property);
    const validationNode = GetValidationNode(methodMethod);
    let conditions = null;
    if (validationNode) {
      conditions = GetCombinedCondition(
        validationNode.id,
        ProgrammingLanguages.JavaScript,
        { filter: { property }, finalResult: 'valid' }
      );
    }

    return `context => {
      let result = {
        errors: [],
        warnings: [],
        success: [],
        valid: true
      };
      let { object, property, validated } = (context || {});
      let model = object || {};
      let valid = false;

      ${conditions || ""};
      result.valid = valid;
      result.validated = validated;
      return result;
    }`;
  }
}
