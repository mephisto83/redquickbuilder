import { GenerateAgentValidationInterfacesAndImplementations } from '../service/validationservice';
export default class ValidatorGenerator {
	static Generate(options: any) {
		let result = GenerateAgentValidationInterfacesAndImplementations();
		return result;
	}
}
