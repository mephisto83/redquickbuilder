import { GenerateAgentPermissionInterfacesAndImplementations } from '../service/permissionservice';
export default class PermissionGenerator {
	static Generate(options: any) {
		let result = GenerateAgentPermissionInterfacesAndImplementations();
		return result;
	}
}
