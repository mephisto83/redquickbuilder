import ControllerGenerator from "./controllergenerator";
import * as Titles from "../components/titles";
import { NodeTypes, GeneratedTypes, Methods, GeneratedConstants, NodeProperties, ConstantsDeclaration, MakeConstant } from "../constants/nodetypes";
import ModelGenerator from "./modelgenerators";
import ExtensionGenerator from "./extensiongenerator";
import MaestroGenerator from "./maestrogenerator";
import ChangeParameterGenerator from "./changeparametergenerator";
import ConstantsGenerator from "./constantsgenerator";
import PermissionGenerator from "./permissiongenerator";
import StreamProcessGenerator from "./streamprocessgenerator";
import { NodesByType, GetNodeProp } from "../actions/uiactions";
import StreamProcessOrchestrationGenerator from "./streamprocessorchestrationgenerator";
import ChangeResponseGenerator from "./changeresponsegenerator";
import ValidationRuleGenerator from "./validationrulegenerator";
import ExecutorGenerator from "./executiongenerator";

export default class Generator {
    static generate(options) {
        var { state, type, key } = options;
        switch (type) {
            case NodeTypes.Controller:
                let temp = ControllerGenerator.Generate({ state, key });
                return temp;
            case NodeTypes.Model:
                return ModelGenerator.Generate({ state, key });
            case NodeTypes.ExtensionType:
                return ExtensionGenerator.Generate({ state, key });
            case NodeTypes.Maestro:
                return MaestroGenerator.Generate({ state, key });
            case GeneratedTypes.ChangeParameter:
                return ChangeParameterGenerator.Generate({ state, key });
            case GeneratedTypes.ChangeResponse:
                return ChangeResponseGenerator.Generate({ state, key });
            case GeneratedTypes.Constants:
                //Add enumerations here.
                let models = NodesByType(state, NodeTypes.Model);
                let functions = NodesByType(state, NodeTypes.Function);
                let enumerations = NodesByType(state, NodeTypes.Enumeration).map(node => {
                    var enums = GetNodeProp(node, NodeProperties.Enumeration);
                    var larg = {};
                    enums.map(t => {
                        larg[MakeConstant(t)] = t;
                    })
                    return {
                        name: GetNodeProp(node, NodeProperties.CodeName),
                        model: larg
                    }
                });
                let streamTypes = {};
                models.map(t => {
                    streamTypes[GetNodeProp(t, NodeProperties.CodeName).toUpperCase()] = GetNodeProp(t, NodeProperties.CodeName).toUpperCase();
                })
                let functionsTypes = {};
                functions.map(t => {
                    functionsTypes[GetNodeProp(t, NodeProperties.CodeName)] = GetNodeProp(t, NodeProperties.CodeName).toUpperCase();
                })
                return ConstantsGenerator.Generate({
                    values: [{
                        name: GeneratedConstants.Methods,
                        model: Methods
                    }, {
                        name: GeneratedConstants.StreamTypes,
                        model: streamTypes
                    }, {
                        name: GeneratedConstants.FunctionName,
                        model: functionsTypes
                    }, ...enumerations],
                    state,
                    key
                });
            case GeneratedTypes.Permissions:
                return PermissionGenerator.Generate({ state, key });
            case GeneratedTypes.StreamProcess:
                return StreamProcessGenerator.Generate({ state, key });
            case GeneratedTypes.StreamProcessOrchestration:
                return StreamProcessOrchestrationGenerator.Generate({ state, key });
            case GeneratedTypes.ValidationRule:
                return ValidationRuleGenerator.Generate({ state, key });
            case GeneratedTypes.Executors:
                return ExecutorGenerator.Generate({ state, key });
        }
    }
}