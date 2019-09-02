import { GenerateModelKeys } from '../service/keyservice';
export default class KeyGenerator {

    static Generate(options) {
        let temp = GenerateModelKeys(options);
        let result = {};
        temp.map(t => {
            result[t.name] = t;
        })
        return result;
    }
}