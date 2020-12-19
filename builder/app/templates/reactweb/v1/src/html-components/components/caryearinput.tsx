import Typeahead from './typeahead';
const CarYearServiceContext: ICarYearServiceContext = {
    carYear: '',
    listeners: [],
    context: {}
}
export interface ICarYearServiceContext {
    carYear: string;
    listeners: { id: string, listener: Function, context: string }[],
    context: {
        [str: string]: {
            carMake: string
        }
    }
}
export function CarYearContextList(args: { id: string, listener: Function, context: string }) {
    CarYearServiceContext.listeners.push(args);
}
export function CarYearServiceRemove(id: string) {
    CarYearServiceContext.listeners = CarYearServiceContext.listeners.filter(v => v.id !== id);
}
export function CarYearService(context: string) {
    if (CarYearServiceContext.context && CarYearServiceContext.context[context]) {
        return CarYearServiceContext.context[context].carMake;
    }
    return CarYearServiceContext.carYear
}
export function SetCarYear(value: string, context?: string) {
    if (context) {
        CarYearServiceContext.context[context].carMake = value;
    }
    else {
        CarYearServiceContext.carYear = value;
    }

    CarYearServiceContext.listeners.forEach((arg: { id: string, listener: Function, context: string }) => {
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
export default class CarYearInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.running = false;
    }
    promise: Promise<void>;
    running: boolean;

    componentDidMount() {
        super.componentDidMount();

        this.setState({
            yearList: this.getYearList()
        })
    }
    suggestionSelected(value: any) {
        super.suggestionSelected(value);
        SetCarYear(value, this.props.serviceContext);
    }
    getYearList() {
        var d = new Date();
        var n = d.getFullYear();
        return ([] as any).interpolate(0, 100, (v: number) => {
            return ({
                title: `${n - v}`,
                value: `${n - v}`
            })
        })
    }
    onTextChange(e: any) {
        const { yearList } = this.state;
        let suggestions: any[] = [];
        const value = e.target.value;
        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, `i`);
            suggestions = yearList.map((v: { title: string }) => v.title).filter((v: any) => regex.test(v));
        }

        this.setState(() => ({
            suggestions,
            text: value
        }));
    }
}

export interface AutoMake {
    make_ID: number;
    make_Name: string;
}