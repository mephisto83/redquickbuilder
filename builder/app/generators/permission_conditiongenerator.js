import { GenerateAgentPermissionInterfacesAndImplementations } from '../service/permissionservice';
export default class PermissionGenerator {

    static Generate(options) {
        let result = GenerateAgentPermissionInterfacesAndImplementations();
        return result;
    }
}