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
    context: {},
    makes: []
}
export interface ICarMakeServiceContext {
    carMake: string;
    listeners: { id: string, listener: Function, context: string, type?: string }[],
    context: {
        [str: string]: {
            carMake: string
        }
    },
    makes: AutoMake[]
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

    CarMakeServiceContext.listeners.filter(v => !v.type).forEach((arg: { id: string, listener: Function, context: string }) => {
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
    CarMakeServiceContext.listeners.filter(v => v.context === type || !context).forEach((arg: { id: string, listener: Function, context: string }) => {
        if (context) {
            if (arg.context === context) {
                arg.listener({ value: `${value}` });
            }
        }
        else if (!arg.context) {
            arg.listener({ value: `${value}` });
        }
    })
}

export const VIN_SET = 'VIN_SET';
export const MAKE_INPUT_CHANGE = 'MAKE_INPUT_CHANGE';
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
                if (val) {
                    this.setState({ ...val })
                }
            },
            type: VIN_SET
        });
        super.componentDidMount();
    }
    componentWillUnmount() {
        CarMakeServiceContext.listeners = CarMakeServiceContext.listeners.filter(v => v.id === this.state.id);
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        let suggestions = (this.state.suggestions || []);
        let value: { value: string, title: string } = suggestions.find((v: { value: string }) => `${v.value}` === this.props.value);
        if (!value) {
            this.promise = this.promise.then(() => {
                let suggestions = (this.state.suggestions || []);
                let value: { value: string, title: string } = suggestions.find((v: { value: string }) => `${v.value}` === this.props.value);
                if (!value) {
                    return redservice().get(`/api/red/autoservice/make/${this.props.value}`).then((make: AutoMake) => {
                        let suggests = this.mergeSuggestions([({ title: make.make_Name, value: make.make_ID })]);
                        let optional: any = {};
                        if (this.state.value === `${make.make_ID}`) {
                            optional.valueTitle = make.make_Name;
                            SetCarMake(`${this.state.value}`, this.props.serviceContext);
                        }
                        this.setState({
                            ...optional,
                            suggestions: suggests
                        });
                    });
                }
            });
        }
        if (prevProps.value !== this.props.value) {
            RaiseEvent(this.props.value, MAKE_INPUT_CHANGE, this.props.serviceContext);
        }
        super.componentDidUpdate(prevProps, prevState, snapshot);
    }
    suggestionSelected(value: any, title: any) {
        super.suggestionSelected(`${value}`, title);
        SetCarMake(`${value}`, this.props.serviceContext);
    }

    onTextChange(e: any) {
        const value = `${e.target.value}`;
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
            if (CarMakeServiceContext.makes && CarMakeServiceContext.makes.length) {
                this.setState(() => ({
                    suggestions: CarMakeServiceContext.makes
                }));
            }
            return redservice().get(`/api/red/autoservice/makers/${value}`).then((makers: AutoMake[]) => {
                if (currentId < this.callId) {
                    return;
                }
                let suggestions = makers.map((make: AutoMake) => ({ title: make.make_Name, value: make.make_ID }));

                if (this.runAgain || currentValue === this.state.value) {
                    let suggests = this.mergeSuggestions(suggestions);
                    CarMakeServiceContext.makes = suggests;
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

    private mergeSuggestions(suggestions: { title: string; value: number; }[]) {
        return [...(this.state.suggestions || []), ...suggestions].unique((va: { value: string; }) => va.value).sort((a: {
            title: string;
        }, b: {
            title: string;
        }) => {
            return `${a.title}`.localeCompare(`${b.title}`);
        });
    }
}

export interface AutoMake {
    make_ID: number;
    make_Name: string;
}