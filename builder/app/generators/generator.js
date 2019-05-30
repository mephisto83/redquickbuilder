import ControllerGenerator from "./controllergenerator";
import * as Titles from "../components/titles";
import { NodeTypes } from "../constants/nodetypes";

export default class Generator {
    static generate(options) {
        var { state, type, key } = options;
        switch (type) {
            case NodeTypes.Controller:
                let temp = ControllerGenerator.Generate({ state, key });
                return temp;
        }
    }
}