import { VIN_SET } from './carmakeinput';
import Typeahead from './typeahead';
// const CarYearServiceContext: ICarYearServiceContext = {
//     carYear: '',
//     listeners: [],
//     context: {}
// }
// export interface ICarYearServiceContext {
//     carYear: string;
//     listeners: { id: string, listener: Function, type?: string, context: string }[],
//     context: {
//         [str: string]: {
//             carMake: string
//         }
//     }
// }
// export function CarYearContextList(args: { type?: string, id: string, listener: Function, context: string }) {
//     CarYearServiceContext.listeners.push(args);
// }
// export function CarYearServiceRemove(id: string) {
//     CarYearServiceContext.listeners = CarYearServiceContext.listeners.filter(v => v.id !== id);
// }
// export function CarYearService(context: string) {
//     if (CarYearServiceContext.context && CarYearServiceContext.context[context]) {
//         return CarYearServiceContext.context[context].carMake;
//     }
//     return CarYearServiceContext.carYear
// }
// export function SetCarYear(value: string, context?: string) {
//     if (context) {
//         CarYearServiceContext.context[context].carMake = value;
//     }
//     else {
//         CarYearServiceContext.carYear = value;
//     }

//     CarYearServiceContext.listeners.forEach((arg: { id: string, listener: Function, context: string }) => {
//         if (context) {
//             if (arg.context === context) {
//                 arg.listener();
//             }
//         }
//         else if (!arg.context) {
//             arg.listener();
//         }
//     })
// }
// export function RaiseEvent(value: any, type?: string, context?: string) {
//     CarYearServiceContext.listeners.filter(v => v.context === type).forEach((arg: { id: string, listener: Function, context: string }) => {
//         if (context) {
//             if (arg.context === context) {
//                 arg.listener({ value: value });
//             }
//         }
//         else if (!arg.context) {
//             arg.listener({ value: value });
//         }
//     })
// }
// export const YEAR_INPUT_CHANGE = 'YEAR_INPUT_CHANGE';



export default class CarYearInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.onTextChange = this.onTextChange.bind(this);
        this.running = false;
    }
    promise: Promise<void>;
    running: boolean;

    componentDidMount() {
        super.componentDidMount();
        // CarYearServiceContext.listeners.push({
        //     id: this.state.id,
        //     context: this.props.context,
        //     listener: (val: { value: string, valueTitle: string }) => {
        //         this.setState({ ...val })
        //     },
        //     type: VIN_SET
        // });
        let list = this.getYearList();
        this.setState({
            yearList: list,
            suggestions: list
        })
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        super.componentDidUpdate(prevProps, prevState, snapshot);
        if (this.props.valueTitle !== prevProps.valueTitle) {
            this.setState({
                valueTitle: this.props.valueTitle,
                value: this.props.value
            });
        }
        // if (prevProps.value !== this.props.value || this.props.serviceContext !== prevProps.serviceContext) {
        //     SetCarYear(`${this.props.value}`, this.props.serviceContext);

        //     if (prevProps.value === this.props.value) {
        //         RaiseEvent(this.props.value, YEAR_INPUT_CHANGE, this.props.serviceContext);
        //     }
        // }
    }
    // componentWillUnmount() {
    //     CarYearServiceContext.listeners = CarYearServiceContext.listeners.filter(v => v.id === this.state.id);
    // }

    suggestionSelected(value: any, title: any) {
        super.suggestionSelected(`${value}`, title);
        // SetCarYear(`${value}`, this.props.serviceContext);
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
        const value = `${e.target.value}`;

        this.setState({
            valueTitle: null,
            value: `${value}`
        });
    }
}

export interface AutoMake {
    make_ID: number;
    make_Name: string;
}