import * as React from 'react';
import View from './view';
import SimpleDropdown from './simpledropdown';
import { InputEvent } from './types';
import InsuranceCarriers from './insurancecarriers';

export default class AutoDetailPolicyInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        let value: AutoDetailPolicy = {};
        this.state = {
            value
        };
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                value: this.props.value || { incidents: [] }
            });
        }
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;
        return (
            <View>
                <SimpleDropdown options={[
                    { "title": "Yes, currently insured", "value": "A" },
                    { "title": "Yes, not currently insured", "value": "B" },
                    { "title": "No", "value": "C" }
                ]} onChange={(evt: InputEvent) => {
                    this.setState({
                        ...this.state.value,
                        insuranceState: evt.target.value
                    }, () => {
                        if (this.props.onChangeText) {
                            this.props.onChangeText(this.state.value)
                        }
                    })
                }} />
                <InsuranceCarriers onChange={(evt: InputEvent) => {
                    this.setState({
                        ...this.state.value,
                        priorInsurance: evt.target.value
                    }, () => {
                        if (this.props.onChangeText) {
                            this.props.onChangeText(this.state.value)
                        }
                    })
                }} />
                <SimpleDropdown options={[
                    { "title": "Greater than or Equal to 250/500 or 300 CSL", "value": "5" },
                    { "title": "Greater than or Equal to 100/300 or 100 CSL, Less than 250/500 or 300 CSL", "value": "4" },
                    { "title": "Greater than State Minimum, Less than 100/300 or 100 CSL", "value": "3" }, { "title": "State Minimum Limits", "value": "1" }]}
                    onChange={(evt: InputEvent) => {
                        this.setState({
                            ...this.state.value,
                            biLimits: evt.target.value
                        }, () => {
                            if (this.props.onChangeText) {
                                this.props.onChangeText(this.state.value)
                            }
                        })
                    }} />
                <SimpleDropdown options={[
                    { "title": "Less than 1 year", "value": "A" },
                    { "title": "At least 1 year but less than 3 years", "value": "B" },
                    { "title": "At least 3 years but less than 5 years", "value": "C" },
                    { "title": "5 years or more", "value": "D" }]}
                    onChange={(evt: InputEvent) => {
                        this.setState({
                            ...this.state.value,
                            numberYearsWithCurrent: evt.target.value
                        }, () => {
                            if (this.props.onChangeText) {
                                this.props.onChangeText(this.state.value)
                            }
                        })
                    }} />
                <SimpleDropdown options={[
                    { "title": "", "value": "" },
                    { "title": "Moved out of state", "value": "A" },
                    { "title": "Separated/divorced (current policy remains in force)", "value": "D" },
                    { "title": "Leaving a policy that remains in force", "value": "B" },
                    { "title": "Other policy is commercial lines", "value": "E" },
                    { "title": "Adding 5th vehicle", "value": "F" },
                    { "title": "Military exception", "value": "H" },
                    { "title": "Customer changing from Progressive Direct", "value": "I" },
                    { "title": "2+ years prior coverage with 0-31 day lapse", "value": "G" },
                    { "title": "Rewrite with less than 2 years prior coverage", "value": "0" }]}
                    onChange={(evt: InputEvent) => {
                        this.setState({
                            ...this.state.value,
                            reasonForNewProgressivePolicy: evt.target.value
                        }, () => {
                            if (this.props.onChangeText) {
                                this.props.onChangeText(this.state.value)
                            }
                        })
                    }} />
                <SimpleDropdown options={[{ "title": "Yes", "value": true }, { "title": "No", "value": false }]}
                    onChange={(evt: InputEvent) => {
                        this.setState({
                            ...this.state.value,
                            autoPolicyCancelced: evt.target.value
                        }, () => {
                            if (this.props.onChangeText) {
                                this.props.onChangeText(this.state.value)
                            }
                        })
                    }} />
            </View>
        );
    }
}

export interface AutoDetailPolicy {
    insuranceState?: string,
    priorInsurance?: string,
    biLimits?: string,
    numberYearsWithCurrent?: string,
    reasonForNewProgressivePolicy?: string,
    autoPolicyCancelced?: boolean
}