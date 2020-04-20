import { GenerateAgentValidationInterfacesAndImplementations } from '../service/validationservice';
export default class ValidatorGenerator {

    static Generate(options) {
        let result = GenerateAgentValidationInterfacesAndImplementations();
        return result;
    }
}