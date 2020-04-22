import { GenerateScreens } from '../service/screenservice';
export default class ScreenGenerator {
	static Generate(options: any) {
		let result = GenerateScreens(options);
		return result;
	}
}
