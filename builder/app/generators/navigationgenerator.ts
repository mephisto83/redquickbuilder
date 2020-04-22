import { GenerateNavigation } from '../service/navigatorservice';
export default class NavigationGenerator {
	static Generate(options: any) {
		let result = GenerateNavigation(options);
		return result;
	}
}
