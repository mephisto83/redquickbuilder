import { GenerateNavigation } from '../service/navigatorservice';
export default class NavigationGenerator {

    static Generate(options) {
        let result = GenerateNavigation(options);
        return result;
    }
}