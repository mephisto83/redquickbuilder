import { GenerateModelKeys } from '../service/keyservice';
import { GenerateUi } from '../service/uiservice';
export default class KeyGenerator {
	static Generate(options: any) {
		let temp: any = GenerateModelKeys(options);
		let temp2: any = GenerateUi(options);
		let result: any = {};
		temp.map((t: { name: string | number; }) => {
			result[t.name] = t;
		});
		temp2.map((t: { name: string | number; }) => {
			result[t.name] = t;
		});
		return result;
	}
}
