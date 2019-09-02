import { GenerateModelKeys } from '../service/keyservice';
export default class KeyGenerator {

    static Generate(options) {
        let result = GenerateModelKeys(options);
        return result;
    }
}