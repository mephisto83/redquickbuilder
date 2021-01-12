import * as React from 'react';
import View from './view';
import CarYearInput from './caryearinput';
import CarMakeInput, { AutoMake } from './carmakeinput';
import CarModelInput from './carmodelinput';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import Observe from './observe';
import { InputEvent } from './types';


let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}

let CarModelServiceContext: any = { cache: [] };
export default class AutoModelInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            modelSuggestions: [],
            autoModel: {}
        };
    }
    count: number = 0;
    isValid() {
        if (this.state.autoModel) {
            if (this.state.autoModel.make_ID &&
                this.state.autoModel.make_Name &&
                this.state.autoModel.model_ID &&
                this.state.autoModel.model_Name &&
                this.state.autoModel.modelYear) {
                return true;
            }
        }
        return false;
    }
    loadModels() {
        let year = this.state.autoModel.modelYear;
        let make = this.state.autoModel.make_ID;
        if (year && make) {
            let handleModels = (res: AutoModel[]) => {
                if (this.count >= before) {
                    this.setState({
                        modelSuggestions: res.map((value: AutoModel) => {
                            return ({ title: value.model_Name, value: value.model_ID })
                        })
                    })
                }
                return res;
            };
            let before = this.count;
            this.count++;
            if (CarModelServiceContext.cache[`${year}/${make}`]) {
                CarModelServiceContext.cache[`${year}/${make}`].then(handleModels);
            }
            else {
                CarModelServiceContext.cache[`${year}/${make}`] = Observe.produce(() => {
                    return redservice().get(`/api/red/autoservice/models/${year}/${make}`).then(handleModels).catch(() => {
                        delete CarModelServiceContext.cache[`${year}/${make}`];
                    })
                });
            }
        }
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                autoModel: this.props.value || {}
            });
        }
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;
        return (
            <View >
                <CarYearInput
                    viewModel={this.props.viewModel}
                    valueTitle={this.state.autoModel.modelYear}
                    value={this.state.autoModel.modelYear}
                    onChange={(year: InputEvent) => {
                        if (year && year.target && year.target.value) {
                            this.setState({
                                autoModel: {
                                    ...this.state.autoModel,
                                    modelYear: year.target.value
                                }
                            });
                        }
                    }}
                    onBlur={() => {
                        if (this.props.onBlur) {
                            this.props.onBlur();
                        }
                    }}
                    onFocus={() => {
                        if (this.props.onFocus) {
                            this.props.onFocus();
                        }
                    }}
                />
                {!this.state.autoModel.modelYear ? null : <CarMakeInput viewModel={this.props.viewModel}
                    valueTitle={this.state.autoModel.make_Name}
                    value={this.state.autoModel.make_ID}
                    onChange={(make: InputEvent) => {
                        if (make && make.target && this.state.autoModel.make_ID !== make.target.value) {
                            this.setState({
                                autoModel: {
                                    ...this.state.autoModel,
                                    make_ID: make.target.value,
                                    model_Name: null,
                                    model_ID: null,
                                    make_Name: make.target.valueTitle,
                                    modelSuggestions: []
                                }
                            }, () => {
                                this.loadModels();
                            });
                        }
                    }}
                    onBlur={() => {
                        if (this.props.onBlur) {
                            this.props.onBlur();
                        }
                    }}
                    onFocus={() => {
                        if (this.props.onFocus) {
                            this.props.onFocus();
                        }
                    }} />}
                <CarModelInput viewModel={this.props.viewModel}
                    suggestions={this.state.modelSuggestions}
                    valueTitle={this.state.autoModel.model_Name}
                    value={this.state.autoModel.model_ID}
                    onChange={(model: InputEvent) => {
                        if(model && model.target && model.target.value)
                        this.setState({
                            autoModel: {
                                ...this.state.autoModel,
                                model_ID: model.target.value,
                                model_Name: model.target.valueTitle
                            }
                        }, () => {
                            if (this.isValid()) {
                                if (this.props.onChange) {
                                    this.props.onChange({ ...this.state.autoModel })
                                }
                                if (this.props.onChangeText) {
                                    this.props.onChangeText({ ...this.state.autoModel })
                                }
                            }
                        });
                    }}
                    onBlur={() => {
                        if (this.props.onBlur) {
                            this.props.onBlur();
                        }
                    }}
                    onFocus={() => {
                        if (this.props.onFocus) {
                            this.props.onFocus();
                        }
                    }} />
            </View>
        );
    }
}

export interface AutoModel {
    make_ID: number;
    make_Name: string;
    model_ID: number;
    model_Name: string;
    modelYear: string;
}