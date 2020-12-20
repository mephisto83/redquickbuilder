import Typeahead from './typeahead';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}

interface ICountryInputContext {
    context: any[]
}
const CountryInputContext: ICountryInputContext = {
    context: []
}
export default class CountryInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();

        this.running = false;
    }
    promise: Promise<void>;
    running: boolean;

    componentDidMount() {
        super.componentDidMount();
        if (!CountryInputContext.context.length) {
            redservice().get(`/api/red/countries/get`).then((countries: Country[]) => {
                let suggestions = countries.map((country: Country) => ({ title: country.name, value: country.code }))
                CountryInputContext.context = suggestions;
                this.setState({
                    suggestions
                });
            });
        }
        else {
            this.setState({
                suggestions: [...CountryInputContext.context]
            });
        }
    }
}

export interface Country {
    code: number;
    name: string;
}