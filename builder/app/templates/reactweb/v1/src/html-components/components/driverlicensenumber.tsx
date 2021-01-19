import * as React from 'react';
import View from './view';
import CarYearInput from './caryearinput';
import CarMakeInput, { AutoMake } from './carmakeinput';
import CarModelInput from './carmodelinput';
import { createRedService } from '../../util/service';
import * as Globals from '../../util/globals';
import Observe from './observe';
import Input from './input';
import { InputEvent } from './types';
import Dropdown from './dropdown';
let _redservice: any;
function redservice() {
    _redservice = _redservice || createRedService(Globals.DEFAULT_URL)
    return _redservice;
}

let CarModelServiceContext: any = { cache: [] };
export default class DriverLicenseNumberInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            modelSuggestions: [],
            phoneNumber: {}
        };
    }
    count: number = 0;
    isValid() {
        if (this.state.phoneNumber) {
            if (this.state.phoneNumber.phoneNumber &&
                this.state.phoneNumber.phoneNumberType) {
                return true;
            }
        }
        return false;
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                phoneNumber: this.props.value || {}
            });
        }
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;
        return (
            <View {...props}>
                <Input
                    value={this.state.phoneNumber.phoneNumber}
                    onChange={(v: InputEvent) => {
                        this.setState({
                            phoneNumber: {
                                ...this.state.phoneNumber,
                                phoneNumberType: v.target.value
                            }
                        });
                        this.pushUpdate();
                    }}
                    placeholder="XXXXXXXXXXXX"
                    data-charset="XXXXXXXXXXXX"
                    pattern="\d\d\d\d\d\d\d\d\d\d" />
            </View>
        );
    }

    private pushUpdate() {
        if (this.state.phoneNumber.phoneNumber && this.state.phoneNumber.phoneNumberType) {
            if (this.props.onTextChange) {
                this.props.onTextChange(this.state.phoneNumber);
            }
            if (this.props.onChange) {
                this.props.onChange(this.state.phoneNumber);
            }
        }
    }
}
