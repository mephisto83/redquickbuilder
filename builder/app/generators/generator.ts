/* eslint-disable no-case-declarations */
import ControllerGenerator from "./controllergenerator";
import {
  NodeTypes,
  GeneratedTypes,
  Methods,
  GeneratedConstants,
  NodeProperties,
  MakeConstant,
  ReactNativeTypes
} from "../constants/nodetypes";
import ModelGenerator from "./modelgenerators";
import ExtensionGenerator from "./extensiongenerator";
import MaestroGenerator from "./maestrogenerator";
import ChangeParameterGenerator from "./changeparametergenerator";
import ConstantsGenerator from "./constantsgenerator";
import PermissionGenerator from "./permission_conditiongenerator";
import StreamProcessGenerator from "./streamprocessgenerator";
import { NodesByType, GetNodeProp } from "../actions/uiactions";
import StreamProcessOrchestrationGenerator from "./streamprocessorchestrationgenerator";
import ChangeResponseGenerator from "./changeresponsegenerator";
import ExecutorGenerator from "./executiongenerator";
import ModelReturnGenerator from "./modelreturngenerator";
import ModelExceptionGenerator from "./modelexceptiongenerator";
import ModelItemFilter from "./modelitemfiltergenerator";
import CustomService from "./customservicegenerator";
import ModelGetGenerator from "./modelgetgenerators";
import ReactNativeScreens from "./screengenerator";
import ReactNativeNavigation from "./navigationgenerator";
import ReactNativeKeys from "./keygenerator";
import ReactNativeConfiguration from "./configurationgenerator";
import ReactNativeControllerActions from "./controlleractionsgenerator";
import ReactNativeDataChainFunctions from "./datachaingenerator";
import ReactNativeSelectorFunctions from "./selectorgenerator";
import ReactNativeLists from "./listsgenerator";
import ValidatorGenerator from "./validatorgenerator";
import FetchServiceGenerator from "./fetchservicegenerator";
import TitleServiceLibraryGenerator from './titleServiceLibraryGenerator';

export default class Generator {
  static generate(options) {
    const { state, type, key, language } = options;
    switch (type) {
      case NodeTypes.Controller:
        return ControllerGenerator.Generate({ state, key, language });
      case NodeTypes.FetchService:
        return FetchServiceGenerator.Generate({ state, key, language });
      case NodeTypes.Model:
        return ModelGenerator.Generate({ state, key, language });
      case NodeTypes.ExtensionType:
        return ExtensionGenerator.Generate({ state, key, language });
      case NodeTypes.Maestro:
        return MaestroGenerator.Generate({ state, key, language });
      case GeneratedTypes.ChangeParameter:
        return ChangeParameterGenerator.Generate({ state, key, language });
      case GeneratedTypes.ChangeResponse:
        return ChangeResponseGenerator.Generate({ state, key, language });
      case GeneratedTypes.Constants:
        // Add enumerations here.
        const models = NodesByType(state, NodeTypes.Model)
          .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
          .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController));
        const functions = NodesByType(state, [
          NodeTypes.Function,
          NodeTypes.Method
        ]);
        const enumerations = NodesByType(state, NodeTypes.Enumeration).map(
          node => {
            const enums = GetNodeProp(node, NodeProperties.Enumeration);
            const larg = {};
            enums.forEach(t => {
              larg[MakeConstant(t.value || t)] = t.value;
            });
            return {
              name: GetNodeProp(node, NodeProperties.CodeName),
              model: larg
            };
          }
        );
        const streamTypes = {};
        models.forEach(t => {
          streamTypes[
            GetNodeProp(t, NodeProperties.CodeName).toUpperCase()
          ] = GetNodeProp(t, NodeProperties.CodeName).toUpperCase();
        });
        const functionsTypes = {};
        functions.forEach(t => {
          functionsTypes[GetNodeProp(t, NodeProperties.CodeName)] = GetNodeProp(
            t,
            NodeProperties.CodeName
          ).toUpperCase();
        });
        return ConstantsGenerator.Generate({
          values: [
            {
              name: GeneratedConstants.Methods,
              model: Methods
            },
            {
              name: GeneratedConstants.StreamTypes,
              model: streamTypes
            },
            {
              name: GeneratedConstants.FunctionName,
              model: functionsTypes
            },
            ...enumerations
          ],
          state,
          key
        });
      case GeneratedTypes.Permissions:
        return PermissionGenerator.Generate({ state, key, language });
      case GeneratedTypes.Validators:
        return ValidatorGenerator.Generate({ state, key, language });
      case GeneratedTypes.StreamProcess:
        return StreamProcessGenerator.Generate({ state, key, language });
      case GeneratedTypes.StreamProcessOrchestration:
        return StreamProcessOrchestrationGenerator.Generate({
          state,
          key,
          language
        });
      // case GeneratedTypes.ValidationRule:
      //     return ValidationRuleGenerator.Generate({ state, key, language });
      case GeneratedTypes.Executors:
        return ExecutorGenerator.Generate({ state, key, language });
      case GeneratedTypes.ModelGet:
        return ModelGetGenerator.Generate({ state, key, language });
      case GeneratedTypes.ModelReturn:
        return ModelReturnGenerator.Generate({ state, key, language });
      case GeneratedTypes.ModelExceptions:
        return ModelExceptionGenerator.Generate({ state, key, language });
      case GeneratedTypes.ModelItemFilter:
        return ModelItemFilter.Generate({ state, key, language });
      case GeneratedTypes.CustomService:
        return CustomService.Generate({ state, key, language });
      case ReactNativeTypes.Screens:
        return ReactNativeScreens.Generate({ state, key, language });
      case ReactNativeTypes.Navigation:
        return ReactNativeNavigation.Generate({ state, key, language });
      case ReactNativeTypes.Keys:
        return ReactNativeKeys.Generate({ state, key, language });
      case ReactNativeTypes.Configuration:
        return ReactNativeConfiguration.Generate({ state, key, language });
      case ReactNativeTypes.ControllerActions:
        return ReactNativeControllerActions.Generate({ state, key, language });
      case GeneratedTypes.CSDataChain:
        return ReactNativeDataChainFunctions.GenerateCS({ state, key, language });
      case ReactNativeTypes.DataChainFunctions:
        return ReactNativeDataChainFunctions.Generate({ state, key, language });
      case ReactNativeTypes.Selectors:
        return ReactNativeSelectorFunctions.Generate({ state, key, language });
      case ReactNativeTypes.Lists:
        return ReactNativeLists.Generate({ state, key, language });
      case ReactNativeTypes.TitleService:
        return TitleServiceLibraryGenerator.Generate({ state, key, language });
      default:
        console.log('unhandled generator case');
        break;
    }
  }
}
