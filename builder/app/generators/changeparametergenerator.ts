/* eslint-disable no-underscore-dangle */
import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  NodeTypes,
  NodesByType,
  GetRootGraph,
  GetMethodNodeProp,
  GetCodeName
} from "../actions/uiactions";
import {
  LinkType,
  NodePropertyTypesByLanguage,
  ProgrammingLanguages,
  NameSpace,
  Methods,
  STANDARD_CONTROLLER_USING,
  STANDARD_TEST_USING,
  NEW_LINE
} from "../constants/nodetypes";
import fs from "fs";
import {
  bindTemplate,
  FunctionConstraintKeys,
  FunctionTemplateKeys,
  FunctionMethodTypes,
  MethodFunctions,
  MethodTemplateKeys,
  AFTER_EFFECTS
} from "../constants/functiontypes";
import NamespaceGenerator from "./namespacegenerator";

const TEST_CLASS = "./app/templates/tests/tests.tpl";
const STREAM_PROCESS_CHANGE_CLASS_EXTENSION =
  "./app/templates/stream_process/stream_process_change_class_extention.tpl";
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR =
  "./app/templates/stream_process/stream_process_change_class_constructor.tpl";
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TESTS =
  "./app/templates/stream_process/tests/stream_process_change_class_constructor.tpl";

const MODEL_STATIC_TEMPLATES = "./app/templates/models/model_statics.tpl";
const PROPERTY_TABS = 6;
export default class ChangeParameterGenerator {
  static Tabs(c) {
    let res = "";
    for (let i = 0; i < c; i++) {
      res += TAB;
    }
    return res;
  }

  static Generate(options) {
    let { state, key } = options;
    const models = NodesByType(state, NodeTypes.Model)
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController));
    const afterEffects = NodesByType(state, NodeTypes.AfterEffect);
    const agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
    const graphRoot = GetRootGraph(state);
    const namespace = graphRoot
      ? graphRoot[GraphMethods.GraphKeys.NAMESPACE]
      : null;

    const _testClass = fs.readFileSync(TEST_CLASS, "utf8");
    const _streamProcessChangeClassExtension = fs.readFileSync(
      STREAM_PROCESS_CHANGE_CLASS_EXTENSION,
      "utf8"
    );
    const _streamProcessChangeClassConstructors = fs.readFileSync(
      STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR,
      "utf8"
    );
    const _streamProcessChangeClassConstrictorsTest = fs.readFileSync(
      STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TESTS,
      "utf8"
    );
    const result = {};
    models.map(model => {
      agents.map(agent => {
        let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
        let testClass = _testClass;

        const constructors = [];
        const tests = [];
        const updates_with = [];
        const staticFunctionTemplate = fs.readFileSync(
          MODEL_STATIC_TEMPLATES,
          "utf8"
        );
        afterEffects
          .filter(afterEffect => {
            const functionType = GetNodeProp(
              afterEffect,
              NodeProperties.AfterMethod
            );
            const setup = GetNodeProp(
              afterEffect,
              NodeProperties.AfterMethodSetup
            );
            if (
              setup &&
              functionType &&
              setup[functionType][FunctionTemplateKeys.ModelOutput]
            ) {
              let method = GraphMethods.GetMethodNode(state, afterEffect.id);
              if (method) {
                let valid =
                  GetMethodNodeProp(
                    method,
                    setup[functionType][FunctionTemplateKeys.Agent]
                  ) === agent.id &&
                  GetMethodNodeProp(
                    method,
                    setup[functionType][FunctionTemplateKeys.ModelOutput]
                  ) == model.id;
                return valid;
              }
            }
            return false;
          })
          .filter(afterEffect => {
            const functionType = GetNodeProp(
              afterEffect,
              NodeProperties.AfterMethod
            );
            const setup = GetNodeProp(
              afterEffect,
              NodeProperties.AfterMethodSetup
            );
            if (AFTER_EFFECTS[functionType] && AFTER_EFFECTS[functionType]) {
              const methodNode = GraphMethods.GetMethodNode(
                state,
                afterEffect.id
              );
              const stream_process_change_parameter =
                AFTER_EFFECTS[functionType][
                  MethodTemplateKeys.stream_process_change_parameter
                ];
              if (stream_process_change_parameter) {
                let spcp_template = fs.readFileSync(
                  stream_process_change_parameter,
                  "utf8"
                );
                spcp_template = bindTemplate(spcp_template, {
                  model: GetCodeName(model),
                  value:
                    GetNodeProp(model, NodeProperties.ValueName) || "value",
                  agent_type: GetCodeName(agent),
                  model_update: GetCodeName(
                    GetMethodNodeProp(
                      methodNode,
                      setup[functionType][FunctionTemplateKeys.UpdateModel]
                    )
                  ),
                  agent:
                    GetNodeProp(agent, NodeProperties.AgentName) || "agent",
                  change_type: `Methods.${
                    setup[functionType][FunctionTemplateKeys.MethodType]
                  }`,
                  method: setup[functionType][FunctionTemplateKeys.MethodType]
                });

                constructors.push(spcp_template);
              }

              const update_with =
                AFTER_EFFECTS[functionType][MethodTemplateKeys.update_with];
              if (update_with) {
                let spcp_template = fs.readFileSync(update_with, "utf8");
                spcp_template = bindTemplate(spcp_template, {
                  model_update: GetCodeName(
                    GetMethodNodeProp(
                      methodNode,
                      setup[functionType][FunctionTemplateKeys.UpdateModel]
                    )
                  )
                });
                updates_with.push(spcp_template + NEW_LINE);
              }
            }
          });
        Object.values(Methods)
          .filter(x => ![Methods.Get, Methods.GetAll].some(v => v == x))
          .map(method => {
            let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;

            streamProcessChangeClassConstructors = bindTemplate(
              streamProcessChangeClassConstructors,
              {
                model: GetCodeName(model),
                value: GetNodeProp(model, NodeProperties.ValueName) || "value",
                agent_type: GetCodeName(agent),
                agent: GetNodeProp(agent, NodeProperties.AgentName) || "agent",
                change_type: `Methods.${method}`,
                method
              }
            );
            let streamProcessChangeClassConstrictorsTest = _streamProcessChangeClassConstrictorsTest;

            streamProcessChangeClassConstrictorsTest = bindTemplate(
              streamProcessChangeClassConstrictorsTest,
              {
                model: GetCodeName(model),
                value: GetNodeProp(model, NodeProperties.ValueName) || "value",
                agent_type: GetCodeName(agent),
                agent: GetNodeProp(agent, NodeProperties.AgentName) || "agent",
                change_type: `Methods.${method}`,
                method
              }
            );
            constructors.push(streamProcessChangeClassConstructors);
            tests.push(streamProcessChangeClassConstrictorsTest);
          });

        const staticDic = {
          property_set_merge: "",
          model: `${GetNodeProp(
            model,
            NodeProperties.CodeName
          )}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`
        };
        constructors.push(bindTemplate(staticFunctionTemplate, staticDic));
        streamProcessChangeClassExtension = bindTemplate(
          streamProcessChangeClassExtension,
          {
            model: GetNodeProp(model, NodeProperties.CodeName),
            agent_type: GetNodeProp(agent, NodeProperties.CodeName),
            updates_with: updates_with.unique().join(""),
            constructors: constructors.unique().join(jNL)
          }
        );

        testClass = bindTemplate(testClass, {
          name: `${GetNodeProp(
            model,
            NodeProperties.CodeName
          )}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`,
          tests: tests.unique(x => x).join("")
        });

        const change_param_name = `${GetNodeProp(
          model,
          NodeProperties.CodeName
        )}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`;
        result[change_param_name] = {
          id: change_param_name,
          name: change_param_name,
          tname: `${GetNodeProp(
            model,
            NodeProperties.CodeName
          )}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}Tests`,
          template: NamespaceGenerator.Generate({
            template: streamProcessChangeClassExtension,
            usings: [
              ...STANDARD_CONTROLLER_USING,
              `${namespace}${NameSpace.Constants}`,
              `${namespace}${NameSpace.Model}`
            ],
            namespace,
            space: NameSpace.Parameters
          }),
          test: NamespaceGenerator.Generate({
            template: testClass,
            usings: [
              ...STANDARD_CONTROLLER_USING,
              ...STANDARD_TEST_USING,
              `${namespace}${NameSpace.Constants}`,
              `${namespace}${NameSpace.Parameters}`,
              `${namespace}${NameSpace.Model}`
            ],
            namespace,
            space: NameSpace.Tests
          })
        };
      });
    });

    return result;
  }
}
const NL = `
                    `;
const jNL = `
`;
const TAB = `   `;
