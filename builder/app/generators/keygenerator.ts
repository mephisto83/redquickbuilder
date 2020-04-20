import { GenerateModelKeys } from '../service/keyservice';
import { GenerateUi } from '../service/uiservice';
export default class KeyGenerator {

    static Generate(options) {
        let temp = GenerateModelKeys(options);
        let temp2 = GenerateUi(options);
        let result = {};
        temp.map(t => {
            result[t.name] = t;
        })
        temp2.map(t => {
            result[t.name] = t;
        })
        return result;
    }
}