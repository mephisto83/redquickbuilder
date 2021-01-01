import Typeahead from './typeahead';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import { CarMakeContextList, CarMakeService, CarMakeServiceRemove, MAKE_INPUT_CHANGE, VIN_SET } from './carmakeinput';
import { CarYearContextList, CarYearService, CarYearServiceRemove, YEAR_INPUT_CHANGE } from './caryearinput';
import InputFunctions from './inputfunctions';

let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}
const CarModelServiceContext: ICarModelServiceContext = {
    carModel: '',
    listeners: [],
    context: {},
    cache: {},
    cacheIndividual: {}
}
export interface ICarModelServiceContext {
    carModel: string;
    listeners: { id: string, listener: Function, context: string, type?: string }[],
    context: {
        [str: string]: {
            carModel: string
        }
    },
    cache: { [key: string]: AutoModel[] },
    cacheIndividual: { [key: string]: AutoModel }
}

export function RaiseEvent(value: any, type?: string, context?: string) {
    CarModelServiceContext.listeners.filter(v => v.context === type).forEach((arg: { id: string, listener: Function, context: string }) => {
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
export default class CarModelInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.onTextChange = this.onTextChange.bind(this);
        this.running = false;
        this.runAgain = false;
        this.showOnEmptyFilter = true;
        this.pendingIndividual = {};
    }
    promise: Promise<void>;
    running: boolean;
    runAgain: boolean;
    pendingIndividual: { [key: string]: boolean };


    componentDidMount() {
        super.componentDidMount();
        CarModelServiceContext.listeners.push({
            id: this.state.id,
            context: this.props.context,
            listener: (val: { value: string, valueTitle: string }) => {
                this.setState({ ...val })
            },
            type: VIN_SET
        });
        CarMakeContextList({
            id: this.state.id,
            type: MAKE_INPUT_CHANGE,
            listener: () => {
                this.setState({
                    make: CarMakeService(this.props.serviceContext || ''),
                    year: CarYearService(this.props.serviceContext || '')
                }, () => {
                    this.updateTitleValue()
                    if (!this.isEditMode()) {
                    }
                    else {
                        this.updateModels();
                    }
                });

            },
            context: this.props.serviceContext || null
        });
        CarYearContextList({
            id: this.state.id,
            type: YEAR_INPUT_CHANGE,
            listener: () => {
                this.setState({
                    make: CarMakeService(this.props.serviceContext || ''),
                    year: CarYearService(this.props.serviceContext || '')
                }, () => {
                    this.updateTitleValue()
                    if (!this.isEditMode()) {

                    }
                    else {
                        this.updateModels();
                    }
                });
            },
            context: this.props.serviceContext || null
        });
    }
    suggestionSelected(value: any, title: any) {
        this.setState({
            value: value,
            valueTitle: title,
            hasFocus: false,
            showSuggestions: false,
            tentativeIndex: null
        })
        InputFunctions.onChange(this, true)({ target: { checked: false, value: `${value}` } });
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        super.componentDidUpdate(prevProps, prevState, snapshot);
        if (prevProps.value !== this.props.value) {
            if (this.props.value !== this.state.value) {
                if (!this.state.valueTitle) {
                    this.updateTitleValue()
                }
                // this.onTextChange({ target: { value: this.props.value } });
            }
        }
    }
    runningTitle: boolean = false;
    runTitleAgain: boolean = false;
    updateTitleValue() {
        this.promise = this.promise.then(() => {
            let year = this.state.year;
            let make = this.state.make;
            let value = this.props.value;
            if (year && make && value) {
                if (!this.runningTitle) {
                    this.runningTitle = true;
                    let handleModel = (model: AutoModel) => {
                        this.runningTitle = false;
                        if (model) {
                            if ((year === this.state.year && make === this.state.make && this.props.value === value)) {
                                if (!this.state.valueTitle) {
                                    this.setState(() => ({
                                        valueTitle: model.model_Name
                                    }));
                                }
                            }
                        }
                        if (this.runTitleAgain) {
                            this.runTitleAgain = false;
                            this.updateTitleValue();
                        }
                    };
                    if (CarModelServiceContext.cacheIndividual[`${this.state.make}/${this.props.value}/${this.state.year}`]) {
                        handleModel(CarModelServiceContext.cacheIndividual[`${this.state.make}/${this.props.value}/${this.state.year}`]);
                        return;
                    }
                    else if (!this.pendingIndividual[`${this.state.make}/${this.props.value}/${this.state.year}`]) {
                        this.pendingIndividual[`${this.state.make}/${this.props.value}/${this.state.year}`] = true;
                        return redservice().get(`/api/red/autoservice/model/${this.state.make}/${this.props.value}/${this.state.year}`).then(handleModel);
                    }
                }
                else {
                    this.runTitleAgain = true;
                }
            }
            else {
                this.setState({
                    suggestions: []
                });
            }
        });
    }
    updateModels() {
        this.promise = this.promise.then(() => {
            let year = this.state.year;
            let make = this.state.make;
            if (year && make) {
                if (!this.running) {
                    this.running = true;
                    let handleModels = (models: AutoModel[]) => {
                        this.running = false;
                        let suggestions = models.map((make: AutoModel) => ({ title: make.model_Name, value: make.model_ID }));
                        if (this.runAgain || (year === this.state.year && make === this.state.make)) {
                            this.setState(() => ({
                                suggestions
                            }));
                        }
                        if (this.runAgain) {
                            this.runAgain = false;
                            this.updateModels();
                        }
                    }
                    if (CarModelServiceContext.cache[`${this.state.year}/${this.state.make}`]) {
                        handleModels(CarModelServiceContext.cache[`${this.state.year}/${this.state.make}`]);
                        return;
                    }
                    else {
                        return redservice().get(`/api/red/autoservice/models/${this.state.year}/${this.state.make}`).then(handleModels);
                    }
                }
                else {
                    this.runAgain = true;
                }
            }
            else {
                this.setState({
                    suggestions: []
                });
            }
        });
    }
    componentWillUnmount() {

        CarModelServiceContext.listeners = CarModelServiceContext.listeners.filter(v => v.id === this.state.id);
        CarMakeServiceRemove(this.state.id);
        CarYearServiceRemove(this.state.id);
    }


    onTextChange(e: any) {
        const value = `${e.target.value}`;

        this.setState({
            valueTitle: null,
            value: value
        });
        if (value.length > 0) {
            this.updateModels();
        }
    }
}

export interface AutoModel {
    make_ID: number;
    make_Name: string;
    model_ID: number;
    model_Name: string;
    modelYear: string;
}