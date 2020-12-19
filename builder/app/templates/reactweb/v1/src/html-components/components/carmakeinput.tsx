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
    listeners: { id: string, listener: Function, context: string }[],
    context: {
        [str: string]: {
            carMake: string
        }
    }
}
export function CarMakeContextList(args: { id: string, listener: Function, context: string }) {
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
export default class CarMakeInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.running = false;
    }
    promise: Promise<void>;
    running: boolean;

    componentDidMount() {
        super.componentDidMount();
    }
    suggestionSelected(value: any) {
        super.suggestionSelected(value);
        SetCarMake(value, this.props.serviceContext);
    }

    onTextChange(e: any) {
        const value = e.target.value;
        if (value.length > 0) {
            this.promise = this.promise.then(() => {
                let currentValue = value;
                return redservice().get(`/api/autoservice/makers/${value}`).then((makers: AutoMake[]) => {
                    let suggestions = makers.map((make: AutoMake) => ({ title: make.make_Name, value: make.make_ID }))
                    if (currentValue === this.state.text) {
                        this.setState(() => ({
                            suggestions
                        }));
                    }
                });
            });
        }
        this.setState(() => ({
            text: value
        }));
    }
}

export interface AutoMake {
    make_ID: number;
    make_Name: string;
}