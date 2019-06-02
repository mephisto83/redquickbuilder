import ControllerGenerator from "./controllergenerator";
import * as Titles from "../components/titles";
import { NodeTypes, GeneratedTypes, Methods, GeneratedConstants, NodeProperties } from "../constants/nodetypes";
import ModelGenerator from "./modelgenerators";
import ExtensionGenerator from "./extensiongenerator";
import MaestroGenerator from "./maestrogenerator";
import ChangeParameterGenerator from "./changeparametergenerator";
import ConstantsGenerator from "./constantsgenerator";
import PermissionGenerator from "./permissiongenerator";
import StreamProcessGenerator from "./streamprocessgenerator";
import { NodesByType, GetNodeProp } from "../actions/uiactions";
import StreamProcessOrchestrationGenerator from "./streamprocessorchestrationgenerator";

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
            case GeneratedTypes.Constants:
                //Add enumerations here.
                let models = NodesByType(state, NodeTypes.Model);
                let streamTypes = {};
                models.map(t => {
                    streamTypes[GetNodeProp(t, NodeProperties.CodeName).toUpperCase()] = GetNodeProp(t, NodeProperties.CodeName).toUpperCase();
                })
                return ConstantsGenerator.Generate({
                    values: [{
                        name: GeneratedConstants.Methods,
                        model: Methods
                    }, {
                        name: GeneratedConstants.StreamTypes,
                        model: streamTypes
                    }],
                    state,
                    key
                });
            case GeneratedTypes.Permissions:
                return PermissionGenerator.Generate({ state, key });
            case GeneratedTypes.StreamProcess:
                return StreamProcessGenerator.Generate({ state, key });
            case GeneratedTypes.StreamProcessOrchestration:
                return StreamProcessOrchestrationGenerator.Generate({ state, key });
        }
    }
}