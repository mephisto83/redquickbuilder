import Typeahead from './typeahead';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}
const CarMakeServiceContext: ICarMakeServiceContext = {
    carMake: '',
    listeners: [],
    context: {}
}
export interface ICarMakeServiceContext {
    carMake: string;
    listeners: { id: string, listener: Function, context: string, type?: string }[],
    context: {
        [str: string]: {
            carMake: string
        }
    }
}
export function CarMakeContextList(args: { id: string, listener: Function, type?: string, context: string }) {
    CarMakeServiceContext.listeners.push(args);
}
export function CarMakeServiceRemove(id: string) {
    CarMakeServiceContext.listeners = CarMakeServiceContext.listeners.filter(v => v.id !== id);
}
export function CarMakeService(context: string) {
    if (CarMakeServiceContext.context && CarMakeServiceContext.context[context]) {
        return CarMakeServiceContext.context[context].carMake;
    }
    return CarMakeServiceContext.carMake
}
export function SetCarMake(value: string, context?: string) {
    if (context) {
        CarMakeServiceContext.context[context].carMake = value;
    }
    else {
        CarMakeServiceContext.carMake = value;
    }

    CarMakeServiceContext.listeners.forEach((arg: { id: string, listener: Function, context: string }) => {
        if (context) {
            if (arg.context === context) {
                arg.listener();
            }
        }
        else if (!arg.context) {
            arg.listener();
        }
    })
}

export function RaiseEvent(value: any, type?: string, context?: string) {
    CarMakeServiceContext.listeners.filter(v => v.context === type).forEach((arg: { id: string, listener: Function, context: string }) => {
        if (context) {
            if (arg.context === context) {
                arg.listener(value);
            }
        }
        else if (!arg.context) {
            arg.listener(value);
        }
    })
}

export const VIN_SET = 'VIN_SET';

export default class CarMakeInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.runAgain = false;
        this.running = false;
        this.callId = 0;
        this.onTextChange = this.onTextChange.bind(this);
    }
    callId: number;
    promise: Promise<void>;
    running: boolean;
    runAgain: boolean;

    componentDidMount() {
        CarMakeServiceContext.listeners.push({
            id: this.state.id,
            context: this.props.context,
            listener: (val: { value: string, valueTitle: string }) => {
                this.setState({ ...val })
            },
            type: VIN_SET
        });
        super.componentDidMount();
    }
    componentWillUnmount() {
        CarMakeServiceContext.listeners = CarMakeServiceContext.listeners.filter(v => v.id === this.state.id);
    }
    suggestionSelected(value: any, title: any) {
        super.suggestionSelected(value, title);
        SetCarMake(value, this.props.serviceContext);
    }

    onTextChange(e: any) {
        const value = e.target.value;
        if (value.length > 0) {
            if (!this.running) {
                this.loadSuggestions(value);
            }
            else {
                this.runAgain = true;
            }
        }
        this.setState({
            valueTitle: null,
            value: value
        });
    }

    private loadSuggestions(value: any) {
        let currentValue = value;
        let currentId = ++this.callId;
        setTimeout(() => {
            if (currentId < this.callId) {
                return;
            }
            return redservice().get(`/api/red/autoservice/makers/${value}`).then((makers: AutoMake[]) => {
                if (currentId < this.callId) {
                    return;
                }
                let suggestions = makers.map((make: AutoMake) => ({ title: make.make_Name, value: make.make_ID }));
                if (this.runAgain || currentValue === this.state.value) {
                    let suggests = [...(this.state.suggestions || []), ...suggestions].unique((va: { value: string }) => va.value).sort((a: {
                        title: string
                    }, b: {
                        title: string
                    }) => {
                        return `${a.title}`.localeCompare(`${b.title}`);
                    });
                    this.setState(() => ({
                        suggestions: suggests
                    }));
                }
                if (this.runAgain) {
                    this.runAgain = false;
                    this.loadSuggestions(this.state.value);
                }
            });
        }, 300)
    }
}

export interface AutoMake {
    make_ID: number;
    make_Name: string;
}