import ControllerGenerator from "./controllergenerator";
import * as Titles from "../components/titles";
import { NodeTypes, GeneratedTypes, Methods, GeneratedConstants } from "../constants/nodetypes";
import ModelGenerator from "./modelgenerators";
import ExtensionGenerator from "./extensiongenerator";
import MaestroGenerator from "./maestrogenerator";
import ChangeParameterGenerator from "./changeparametergenerator";
import ConstantsGenerator from "./constantsgenerator";

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
                return ConstantsGenerator.Generate({
                    values: [{
                        name: GeneratedConstants.Methods,
                        model: Methods
                    }], 
                    state, 
                    key
                });
        }
    }
}