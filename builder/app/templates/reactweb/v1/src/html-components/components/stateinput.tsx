import Typeahead from './typeahead';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}

interface IStateInputContext {
    context: any[]
}
const StateInputContext: IStateInputContext = {
    context: []
};

export default class StateInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.running = false;
    }
    promise: Promise<void>;
    running: boolean;

    componentDidMount() {
        super.componentDidMount();
        if (!StateInputContext.context.length) {
            redservice().get(`/api/red/states/get`).then((makers: StateProvince[]) => {
                let suggestions = makers.map((make: StateProvince) => ({ title: make.name, value: make.abbreviation }))
                StateInputContext.context = suggestions;
                this.setState({
                    suggestions
                });
            });
        }
        else {
            this.setState({
                suggestions: [...StateInputContext.context]
            });
        }
    }
}

export interface StateProvince {
    abbreviation: number;
    name: string;
}