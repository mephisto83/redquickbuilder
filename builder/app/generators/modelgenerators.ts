/* eslint-disable no-underscore-dangle */
import * as GraphMethods from "../methods/graph_methods";
import {
  GetNodeProp,
  NodeProperties,
  GetRootGraph,
  NodesByType,
  NodePropertyTypes,
  NEW_LINK,
  GetCurrentGraph,
  GetCodeName,
  GetModelPropertyChildren,
  GetLinkProperty,
  GetNodeType
} from "../actions/uiactions";
import {
  LinkType,
  NodePropertyTypesByLanguage,
  ProgrammingLanguages,
  Usings,
  ValidationRules,
  NameSpace,
  NodeTypes,
  STANDARD_CONTROLLER_USING,
  NEW_LINE,
  LinkProperties,
  LinkPropertyKeys
} from "../constants/nodetypes";
import fs from "fs";
import { bindTemplate } from "../constants/functiontypes";
import NamespaceGenerator from "./namespacegenerator";
const MODEL_TEMPLATE = "./app/templates/models/model.tpl";
const MODEL_PROPERTY_TEMPLATE = "./app/templates/models/model_property.tpl";
const MODEL_STATIC_TEMPLATES = "./app/templates/models/model_statics.tpl";
const MODEL_ATTRIBUTE_TEMPLATE = "./app/templates/models/model_attributes.tpl";
export default class ModelGenerator {
  static Generate(options) {
    const { state } = options;
    const graphRoot = GetRootGraph(state);
    const models = NodesByType(state, NodeTypes.Model)
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController))
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
    const result = {};
    models.map(model => {
      const res = ModelGenerator.GenerateModel({
        graph: graphRoot,
        nodeId: model.id,
        state
      });
      result[res.id] = res;
    });

    return result;
  }

  static GenerateModel(options) {
    const { state, graph, nodeId } = options;
    const usings = [];
    const templateSwapDictionary = {};
    const graphRoot = GetRootGraph(state);
    const namespace = graphRoot
      ? graphRoot[GraphMethods.GraphKeys.NAMESPACE]
      : null;

    const node = GraphMethods.GetNode(graph, nodeId);
    if (!node) {
      return null;
    }
    templateSwapDictionary.model = GetNodeProp(node, NodeProperties.CodeName);
    templateSwapDictionary.base_model = GetNodeProp(node, NodeProperties.IsUser)
      ? "RedUser"
      : "DBaseData";
    templateSwapDictionary.account_enabling_func = "";
    if (GetNodeProp(node, NodeProperties.IsUser)) {
      templateSwapDictionary.account_enabling_func = `

        public static User Create(RedExternalLoginViewModel model)
        {
            return new User
            {
                Email = model.Email,
                UserName = model.UserName
            };
        }
        public static User Create(RedRegisterViewModel model)
        {
            return new User
            {
                Email = model.Email,
                UserName = model.UserName
            };
        }`;
    }
    templateSwapDictionary.attributes = "";
    let connectedProperties = GetModelPropertyChildren(node.id); //Get all properties including link to other models
    //  GraphMethods.getNodesByLinkType(graph, {
    //   id: node.id,
    //   type: LinkType.PropertyLink,
    //   direction: GraphMethods.SOURCE
    // });
    const logicalParents = [];// No more having parents referencing back.
    //  GraphMethods.getNodesByLinkType(graph, {
    //   id: node.id,
    //   type: LinkType.LogicalChildren,
    //   direction: GraphMethods.TARGET
    // }).filter(x => x.id !== node.id);
    connectedProperties = [...connectedProperties, ...logicalParents];
    const propertyTemplate = fs.readFileSync(MODEL_PROPERTY_TEMPLATE, "utf8");
    const attributeTemplate = fs.readFileSync(MODEL_ATTRIBUTE_TEMPLATE, "utf8");
    const staticFunctionTemplate = fs.readFileSync(
      MODEL_STATIC_TEMPLATES,
      "utf8"
    );

    const validatorFunctions = GraphMethods.getNodesByLinkType(graph, {
      id: nodeId,
      type: LinkType.ValidatorModel,
      direction: GraphMethods.TARGET
    })
      .map(t => GetNodeProp(t, NodeProperties.CodeName))
      .map(t => ModelGenerator.tabs(1) + `[${t}]` + NEW_LINE)
      .join("");
    templateSwapDictionary.attributes = validatorFunctions;

    const staticFunctions = [];
    const properties = connectedProperties
      .filter(x => !GetNodeProp(x, NodeProperties.IsDefaultProperty))
      .filter(x => x.id !== nodeId)
      .map(propNode => {
        const connectedAttributes = GraphMethods.getNodesByLinkType(graph, {
          id: propNode.id,
          type: LinkType.AttributeLink,
          direction: GraphMethods.SOURCE
        });
        let propertyInstanceTemplate = propertyTemplate;
        const np =
          GetNodeProp(propNode, NodeProperties.UIAttributeType) ||
          NodePropertyTypes.STRING;
        if (Usings[ProgrammingLanguages.CSHARP][np]) {
          usings.push(
            ...Usings[ProgrammingLanguages.CSHARP][np],
            `${namespace}${NameSpace.Model}`,
            `${namespace}${NameSpace.Extensions}`
          );
        }
        let propType =
          NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][np];

        if (GetNodeProp(propNode, NodeProperties.IsTypeList)) {
          const types = GraphMethods.GetNodesLinkedTo(graph, {
            id: propNode.id,
            link: LinkType.ModelTypeLink
          });
          if (types && types.length) {
            propType = GetCodeName(types[0]);
            propType = `IList<${propType}>`;
          }
        } else if (GetNodeProp(propNode, NodeProperties.UIModelType)) {
          propType = "string";
        } else if (
          GetNodeProp(propNode, NodeProperties.NODEType) === NodeTypes.Model
        ) {
          let propLink = GraphMethods.GetLinkBetween(nodeId, propNode.id, graph);
          if (propLink) {
            switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
              case LinkType.UserLink:
                throw new Error('unhandled');
              default:
                propType = "IList<string>"; // changed from string => ilist<string> cause we are keeping references with the model.
                break;
            }
          }
          else {
            propLink = GraphMethods.GetLinkBetween(propNode.id, nodeId, graph);
            switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
              case LinkType.UserLink:
                propType = 'string';
                return false;
              default:
                throw new Error('unhandled');
            }
          }
        }
        if (GetNodeProp(propNode, NodeProperties.UseModelAsType)) {
          if (GetNodeProp(propNode, NodeProperties.IsReferenceList)) {
            propType = `IList<${propType}>`;
          }
        }

        const propSwapDictionary = {
          model: GetNodeProp(node, NodeProperties.CodeName),
          property_type: propType,
          property: GetNodeProp(propNode, NodeProperties.CodeName),
          attributes: connectedAttributes
            .map(attr => {
              const optionLists = GraphMethods.getNodesByLinkType(graph, {
                id: attr.id,
                type: LinkType.Option,
                direction: GraphMethods.SOURCE
              });
              let optionsList = [];
              optionLists.map(ol => {
                const ols = GraphMethods.getNodesByLinkType(graph, {
                  id: ol.id,
                  type: LinkType.OptionItem,
                  direction: GraphMethods.SOURCE
                });
                ols.map(_ols => {
                  if (GetNodeProp(_ols, NodeProperties.UseCustomUIOption)) {
                    optionsList.push(
                      GetNodeProp(_ols, NodeProperties.UIOptionTypeCustom)
                    );
                  } else {
                    optionsList.push(
                      GetNodeProp(_ols, NodeProperties.UIOptionType)
                    );
                  }
                });
              });
              optionsList = optionsList.unique().map(t => `UIAttribute.${t}`);

              const ReverseRules = {};
              Object.keys(ValidationRules).forEach(ruleKey => {
                ReverseRules[ValidationRules[ruleKey]] = ruleKey;
              });
              const validations = [];
              if (GetNodeProp(attr, NodeProperties.UseUIValidations)) {
                GraphMethods.getNodesByLinkType(graph, {
                  id: attr.id,
                  type: LinkType.Validation,
                  direction: GraphMethods.SOURCE
                }).map(vnode => {
                  GraphMethods.getNodesByLinkType(graph, {
                    id: vnode.id,
                    type: LinkType.ValidationItem,
                    direction: GraphMethods.SOURCE
                  }).map(vnodeItem => {
                    validations.push(
                      `ValidationRules.${
                      ReverseRules[
                      GetNodeProp(
                        vnodeItem,
                        NodeProperties.UIValidationType
                      )
                      ]
                      }`
                    );
                  });
                });
              }
              let choiceName = null;
              if (GetNodeProp(attr, NodeProperties.UIExtensionList)) {
                GraphMethods.getNodesByLinkType(graph, {
                  id: attr.id,
                  type: LinkType.Extension,
                  direction: GraphMethods.SOURCE
                }).map(vnode => {
                  choiceName = GetNodeProp(vnode, NodeProperties.CodeName);
                });
              }

              const options2 =
                optionsList && optionsList.length
                  ? bindTemplate(
                    `Options = new string[] { {{options_list}} },`,
                    {
                      options_list: optionsList.map(t => `${t}`).join(", ")
                    }
                  )
                  : "";

              const validationRules =
                validations && validations.length
                  ? bindTemplate(
                    `ValidationRules = new string[] { {{validation_list}} },`,
                    {
                      validation_list: validations.map(t => `${t}`).join(", ")
                    }
                  )
                  : "";

              const choiceType = choiceName
                ? bindTemplate("ChoiceType = {{choice_type}}.Name,", {
                  choice_type: choiceName
                })
                : "";

              const attributeSwapDictionary = {
                property: GetNodeProp(propNode, NodeProperties.CodeName),
                property_type: GetNodeProp(
                  propNode,
                  NodeProperties.UseModelAsType
                )
                  ? GetNodeProp(propNode, NodeProperties.UIModelType)
                  : GetNodeProp(propNode, NodeProperties.UIAttributeType),
                ui_title: GetNodeProp(propNode, NodeProperties.UIName),
                singular: !!GetNodeProp(propNode, NodeProperties.UISingular),
                options: options2,
                choice_type: choiceType,
                validation_rules: validationRules
              };

              return bindTemplate(attributeTemplate, attributeSwapDictionary);
            })
            .filter(x => x)
            .join("\r\n")
        };

        propertyInstanceTemplate = bindTemplate(
          propertyInstanceTemplate,
          propSwapDictionary
        );
        return propertyInstanceTemplate;
      }).filter(x => x);
    if (
      GetNodeProp(node, NodeProperties.HasLogicalChildren) &&
      GetNodeProp(node, NodeProperties.ManyToManyNexus)
    ) {
      (GetNodeProp(node, NodeProperties.LogicalChildrenTypes) || []).map(t => {
        const propNode = GraphMethods.GetNode(GetCurrentGraph(state), t);
        const propSwapDictionary = {
          property_type:
            NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][
            NodePropertyTypes.STRING
            ],
          property: GetNodeProp(propNode, NodeProperties.CodeName),
          attributes: ""
        };

        properties.push(bindTemplate(propertyTemplate, propSwapDictionary));
      });
    }

    const staticDic = {
      model: GetNodeProp(node, NodeProperties.CodeName)
    };

    const _properties = GetModelPropertyChildren(node.id, {
      skipLogicalChildren: false // now we are switching to references being held with the object.
    })
      .map(v => {
        const propType = GetNodeProp(v, NodeProperties.UIAttributeType);
        const nodeType = GetNodeType(v);
        if (nodeType === NodeTypes.Model) {
          const modelLink = GraphMethods.GetLinkBetween(v.id, node.id, graph) || GraphMethods.GetLinkBetween(node.id, v.id, graph);
          if (GetLinkProperty(modelLink, LinkPropertyKeys.TYPE) === LinkType.UserLink) {
            return `if(a.${GetCodeName(v)} == null) {
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
          }
          return `if(a.${GetCodeName(v)} == null || a.${GetCodeName(v)}.Count == 0) {
            model.${GetCodeName(v)} = b.${GetCodeName(v)};
          }`;
        }
        switch (propType) {
          case NodePropertyTypes.STRING:
            return `if(string.IsNullOrEmpty(a.${GetCodeName(v)})){
            model.${GetCodeName(v)} = b.${GetCodeName(v)};
          }`;
          case NodePropertyTypes.LISTOFSTRINGS:
          case NodePropertyTypes.PHONENUMBER:
          case NodePropertyTypes.EMAIL:
          case NodePropertyTypes.DATETIME:
            return `if(a.${GetCodeName(v)} == null){
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
          case NodePropertyTypes.BOOLEAN:
            return `if(!a.${GetCodeName(v)}){
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
          case NodePropertyTypes.DOUBLE:
          case NodePropertyTypes.FLOAT:
          case NodePropertyTypes.INT:
            return `if(a.${GetCodeName(v)} == 0){
                  model.${GetCodeName(v)} = b.${GetCodeName(v)};
                }`;
          default: break;
        }
        return null;
      })
      .filter(x => x)
      .join(NEW_LINE);
    staticDic.property_set_merge = _properties;

    staticFunctions.push(bindTemplate(staticFunctionTemplate, staticDic));

    if (GetNodeProp(node, NodeProperties.IsUser)) {
      const agenNodes = NodesByType(state, NodeTypes.Model).filter(
        x => x.id !== node.id && GetNodeProp(x, NodeProperties.IsAgent)
      );
      agenNodes.map(agent => {
        let propertyInstanceTemplate = propertyTemplate;
        const propSwapDictionary = {
          property_type:
            NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][
            NodePropertyTypes.STRING
            ],
          property: GetNodeProp(agent, NodeProperties.CodeName),
          attributes: ""
        };
        propertyInstanceTemplate = bindTemplate(
          propertyInstanceTemplate,
          propSwapDictionary
        );
        properties.push(propertyInstanceTemplate);
      });
    }
    templateSwapDictionary.properties = properties.join("");
    templateSwapDictionary.staticFunctions = staticFunctions
      .unique(x => x)
      .join("\n");

    let modelTemplate = fs.readFileSync(MODEL_TEMPLATE, "utf8");
    modelTemplate = bindTemplate(modelTemplate, templateSwapDictionary);

    const result = {
      id: GetNodeProp(node, NodeProperties.CodeName),
      name: GetNodeProp(node, NodeProperties.CodeName),
      template: NamespaceGenerator.Generate({
        template: modelTemplate,
        usings: [
          ...usings,
          `RedQuickCore.Identity`,
          ...STANDARD_CONTROLLER_USING
        ],
        namespace,
        space: NameSpace.Model
      })
    };
    return result;
  }

  static tabs(c) {
    let res = "";
    const TAB = "\t";
    for (let i = 0; i < c; i++) {
      res += TAB;
    }
    return res;
  }
}
