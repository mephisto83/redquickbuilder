import Typeahead from './typeahead';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import { CarMakeContextList, CarMakeService, CarMakeServiceRemove } from './carmakeinput';
import { CarYearContextList, CarYearService, CarYearServiceRemove } from './caryearinput';

let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}

export default class CarModelInput extends Typeahead {
    constructor(props: any) {
        super(props);
        this.promise = Promise.resolve();
        this.onTextChange = this.onTextChange.bind(this);
        this.running = false;
        this.runAgain = false;
        this.showOnEmptyFilter = true;
    }
    promise: Promise<void>;
    running: boolean;
    runAgain: boolean;


    componentDidMount() {
        super.componentDidMount();
        CarMakeContextList({
            id: this.state.id,
            listener: () => {
                this.setState({
                    make: CarMakeService(this.props.serviceContext || '')
                });
                this.updateModels();
            },
            context: this.props.serviceContext || null
        });
        CarYearContextList({
            id: this.state.id,
            listener: () => {
                this.setState({
                    year: CarYearService(this.props.serviceContext || '')
                });
                this.updateModels();
            },
            context: this.props.serviceContext || null
        });
    }
    updateModels() {
        this.promise = this.promise.then(() => {
            let year = this.state.year;
            let make = this.state.make;
            if (year && make) {
                if (!this.running) {
                    this.running = true;
                    return redservice().get(`/api/red/autoservice/models/${this.state.year}/${this.state.make}`).then((models: AutoModel[]) => {
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
                    });
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

        CarMakeServiceRemove(this.state.id);
        CarYearServiceRemove(this.state.id);
    }


    onTextChange(e: any) {
        const value = e.target.value;
        
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