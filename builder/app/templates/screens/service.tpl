import { createRedService } from './service';
import * as Globals from './globals';

const endpoints = {{endpoints}};

let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}
export default {
{{service_methods}}
}
