import * as React from 'react';
import View from './view';
import { InputEvent } from './types';
import Dropdown from './dropdown';

const dataSource = {
    "categories": [
        { "value": "01", "title": "Homemaker (full-time)" }, { "value": "02", "title": "Retired (full-time)" },
        { "value": "03", "title": "Other" }, { "value": "04", "title": "Student (full-time)" },
        { "value": "AA", "title": "Agriculture/Forestry/Fishing" },
        { "value": "AB", "title": "Art/Design/Media" }, { "value": "AC", "title": "Banking/Finance/Real Estate" }, { "value": "AD", "title": "Business/Sales/Office" },
        { "value": "AE", "title": "Construction / Energy / Mining" }, { "value": "AF", "title": "Education/Library" }, { "value": "AG", "title": "Engineer/Architect/Science/Math" },
        { "value": "AH", "title": "Food Service / Hotel Services" }, { "value": "AJ", "title": "Government/Military" }, { "value": "AK", "title": "Information Technology" }, { "value": "AL", "title": "Insurance" },
        { "value": "AM", "title": "Legal/Law Enforcement/Security" }, { "value": "AN", "title": "Medical/Social Services/Religion" }, { "value": "AP", "title": "Personal Care/Service" },
        { "value": "AQ", "title": "Production / Manufacturing" }, { "value": "AR", "title": "Repair / Maintenance / Grounds" }, { "value": "AS", "title": "Sports/Recreation" },
        { "value": "AT", "title": "Travel / Transportation / Storage" }], "01": [{ "value": "010", "title": "Homemaker (full-time)" }], "02": [{ "value": "020", "title": "Retired (full-time)" }],
    "03": [{ "value": "030", "title": "Unemployed" }], "04": [{ "value": "040", "title": "Student (full-time)" }], "": [{ "value": "", "title": "" }, { "value": "AT0", "title": "Administrative Assistant" },
    { "value": "AT1", "title": "Air Traffic Control" }, { "value": "AT2", "title": "Airport Operations Crew" }, { "value": "AT3", "title": "Bellhop/Porter" }, { "value": "AT4", "title": "Clerk" },
    { "value": "AT5", "title": "Crane Loader/Operator" }, { "value": "AT6", "title": "Dispatcher" }, { "value": "AT7", "title": "Driver - Bus/Streetcar" }, { "value": "AT8", "title": "Driver - Taxi/Limo" }, { "value": "AT9", "title": "Driver - Truck/Delivery" }, { "value": "ATA", "title": "Flight Attendant" }, { "value": "ATB", "title": "Laborer" }, { "value": "ATC", "title": "Longshoreman" }, { "value": "ATD", "title": "Manager - Warehouse/District" }, { "value": "ATE", "title": "Mate/Sailor" }, { "value": "ATF", "title": "Parking Lot Attendant" }, { "value": "ATG", "title": "Pilot/Captain/Engineer" }, { "value": "ATH", "title": "Railroad Worker" }, { "value": "ATJ", "title": "Receptionist/Secretary" }, { "value": "ATK", "title": "Shipping/Receiving Clerk" }, { "value": "ATL", "title": "Subway/Light Rail Operator" }, { "value": "ATM", "title": "Ticket Agent" }, { "value": "ATN", "title": "Transportation Specialist" },
    { "value": "ATP", "title": "Travel Agent" }, { "value": "ATZ", "title": "Other" }]
}
export default class EmploymentOccupationInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            employmentOccupation: {}
        };
    }
    isValid() {
        if (this.state.employmentOccupation) {
            if (this.state.employmentOccupation.employmentId &&
                this.state.employmentOccupation.employmentName &&
                this.state.employmentOccupation.occupationId &&
                this.state.employmentOccupation.occupationName) {
                return true;
            }
        }
        return false;
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                employmentOccupation: this.props.value || {}
            });
        }
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;
        const { categories } = dataSource;
        const occupation = (dataSource as any)[this.state.employmentOccupation.occupationId];
        return (
            <View >
                <Dropdown options={categories} value={this.state.employmentOccupation.occupationId} onChange={(val: InputEvent) => {
                    if (val.target.value) {
                        let category = categories.find(v => v.value === val.target.value);
                        if (category && category.value !== this.state.employmentOccupation.occupationId) {
                            this.setState({
                                employmentOccupation: {
                                    ...this.state.employmentOccupation,
                                    employmentId: category.value,
                                    employmentName: category.title,
                                    occupationId: null,
                                    occupationName: null
                                }
                            }, () => {
                                if (this.props.onChangeText) {
                                    this.props.onChangeText(this.state.employmentOccupation);
                                }
                            });
                        }
                    }
                }} />
                <Dropdown
                    options={occupation}
                    value={this.state.employmentOccupation.employmentId}
                    onChange={(val: InputEvent) => {
                        if (val.target.value) {
                            let category = occupation.find((v: { title: string, value: string }) => v.value === val.target.value);
                            if (category && category.value !== this.state.employmentOccupation.employmentId) {
                                this.setState({
                                    employmentOccupation: {
                                        ...this.state.employmentOccupation,
                                        occupationId: category.value,
                                        occupationName: category.title
                                    }
                                }, () => {
                                    if (this.props.onChangeText) {
                                        this.props.onChangeText(this.state.employmentOccupation);
                                    }
                                });
                            }
                        }
                    }} />
            </View>
        );
    }
}

export interface EmploymentOccupation {
    employmentId: number;
    employmentName: string;
    occupationId: number;
    occupationName: string;
}