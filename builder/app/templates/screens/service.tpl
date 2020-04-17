import { createRedService } from './service';
import * as Globals from './globals';

const endpoints = {{endpoints}};

let _redservice{{any}};
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}
const serviceImpl = {
{{service_methods}}
};

{{serviceRequirements}}

function isGuid(stringToTest{{any}}) {
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
}
export default serviceImpl;
