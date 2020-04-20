import { GenerateScreens } from '../service/screenservice';
export default class ScreenGenerator {

    static Generate(options) {
        let result = GenerateScreens(options);
        return result;
    }
}