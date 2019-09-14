import * as RedService from './service';
import * as Globals from './globals';

const endpoints = {{endpoints}};

var _redservice;
function redservice() {
    _redservice = _redservice || RedService.CreateRedService(Globals.DEFAULT_URL)
    return _redservice;
}
export default {
{{service_methods}}
}