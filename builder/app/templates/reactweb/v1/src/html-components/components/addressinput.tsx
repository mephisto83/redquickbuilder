import React from 'react';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';
import './addressinput.css';
import { uuidv4 } from './util';

const AddresInputContext = {
    promise: Promise.resolve()
}
const address_view_order = ['street_number', 'route', 'locality', 'administrative_area_level_1', 'country', 'postal_code'];
export default class AddressInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        const componentForm = {
            street_number: "short_name",
            route: "long_name",
            locality: "long_name",
            administrative_area_level_1: "short_name",
            country: "long_name",
            postal_code: "short_name",
        };
        this.fillInAddress = this.fillInAddress.bind(this);

        this.state = {
            id: `component_${uuidv4()}`,
            componentId: `component_${uuidv4()}`,
            query: null,
            autocomplete: null,
            componentForm
        }
    }
    convertToNetCore(obj: GoogleAddress): GoogleAddressNetCore {
        return {
            administrativeAreaLevel1: obj.administrative_area_level_1,
            country: obj.country,
            postalCode: obj.postal_code,
            locality: obj.locality,
            route: obj.route,
            streetNumber: obj.street_number,
            id: obj.id
        }
    }

    convertFromNetCore(obj: GoogleAddressNetCore): GoogleAddress {
        return {
            administrative_area_level_1: obj.administrativeAreaLevel1,
            country: obj.country,
            locality: obj.locality,
            postal_code: obj.postalCode,
            route: obj.route,
            street_number: obj.streetNumber,
            id: obj.id
        }
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        let tempCore: any = {}
        let { value } = this.props;
        let coreItem: any = value ? this.convertFromNetCore(value) : {};
        if (prevProps && prevProps.value && this.props.value) {
            let updated = false;
            if (value) {
                for (let i in value) {
                    if (value[i] !== prevProps.value[i]) {
                        if (this.state.componentForm) {
                            tempCore = {
                                ...this.state.componentForm,
                                ...coreItem,
                                [i]: value[i]
                            };
                            updated = true;
                        }
                    }
                }
            }
            if (value && updated) {
                this.setState({
                    componentForm: {
                        ...tempCore,
                        ...coreItem
                    }
                });
            }
        }

        this.updateAddressHtml(coreItem);
    }
    updateAddressHtml(tempCore: any) {
        let updatedQuery = '';
        address_view_order.forEach((addressType: string) => {
            if (tempCore[addressType]) {
                const val = tempCore[addressType];
                let el: any = document.querySelector(`#${this.state.componentId} [data-field="${addressType}"]`);
                if (el) {
                    el.value = val;
                    updatedQuery += ` ${val}`;
                }
            }
        });
        if (this.state.query !== updatedQuery) {

            let el: any = document.querySelector(`#${this.state.componentId} .search-location-input input`);
            if (el) {
                el.value = updatedQuery;
                // this.setState({ query: updatedQuery });
            }
        }
    }
    static initialized: boolean = false;
    componentDidMount() {
        let api: string = '';
        if ((window as any).$windowSettings) {
            api = (window as any).$windowSettings.GoogleApiKey;
        }
        if (this.props.apiKey) {
            api = this.props.apiKey;
        }
        if (this.props.value) {
            this.setState({
                ...this.props.value
            });
            let { value } = this.props;
            if (value) {
                let coreItem: any = this.convertFromNetCore(value);
                this.setState({
                    componentForm: {
                        ...coreItem
                    }
                });
            }
        }
        if (AddressInput.initialized) {
            this.initAutocomplete();
        }
        else {
            this.loadScript(`https://maps.googleapis.com/maps/api/js?key=${api}&libraries=places`,
                () => {
                    this.initAutocomplete();
                }
            );
        }
    }
    initAutocomplete() {
        let { autocomplete } = this.state;
        let el: any = document.getElementById(this.state.id);
        // Create the autocomplete object, restricting the search predictions to
        // geographical location types.
        autocomplete = new google.maps.places.Autocomplete(el, { types: ["geocode"] });
        // Avoid paying for data that you don't need by restricting the set of
        // place fields that are returned to just the address components.
        autocomplete.setFields(["address_component"]);
        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        autocomplete.addListener("place_changed", this.fillInAddress);
        this.setState({ autocomplete });
    }
    fillInAddress() {
        let { autocomplete, componentForm } = this.state;
        // Get the place details from the autocomplete object.
        const place = autocomplete.getPlace();
        let updatedQuery = '';
        for (const component in componentForm) {
            let el: any = document.querySelector(`#${this.state.componentId} [data-field="${component}"]`);
            if (el) {
                el.value = "";
                el.disabled = false;
            }
        }
        let output: any = {};
        // Get each component of the address from the place details,
        // and then fill-in the corresponding field on the form.
        for (const component of place.address_components) {
            const addressType = component.types[0];

            if (componentForm[addressType]) {
                const val = component[componentForm[addressType]];
                let el: any = document.querySelector(`#${this.state.componentId} [data-field="${addressType}"]`);
                if (el) {
                    el.value = val;
                    output[addressType] = component[componentForm[addressType]]
                    updatedQuery += ` ${val}`;
                }
            }
        }
        for (const component in componentForm) {
            let el: any = document.querySelector(`#${this.state.componentId} [data-field="${component}"]`);
            if (el) { el.disabled = true; }
        }
        if (updatedQuery) {
            this.setState({ query: updatedQuery })
        }
        output = this.convertToNetCore(output)
        if (this.props.onChange) {
            this.props.onChange(output);
        }
        if (this.props.onChangeText) {
            this.props.onChangeText(output);
        }
    }
    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    geolocate() {
        let { autocomplete } = this.state;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                const circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy,
                });
                autocomplete.setBounds(circle.getBounds());
            });
        }
    }
    loadScript(url: string, callback: Function) {
        let existingScript = document.querySelector(`[src="${url}"]`);
        if (existingScript && callback) {
            AddresInputContext.promise = AddresInputContext.promise.then(() => {
                callback();
            })

            return;
        }
        let addressResolution: Function | null = null;
        AddresInputContext.promise = AddresInputContext.promise.then(() => {
            return new Promise((resolve: Function, fail) => {
                addressResolution = resolve;
            })
        })
        let script: any = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    callback();
                    if (addressResolution) {
                        addressResolution();
                    }
                }
            };
        } else {
            script.onload = () => {
                callback();
                if (addressResolution) {
                    addressResolution();
                }
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    isEditMode() {
        let { viewModel } = this.props;

        let editMode = false;
        if ($CreateModels && $UpdateModels) {
            if (($CreateModels as any)[viewModel] || ($UpdateModels as any)[viewModel]) {
                editMode = true;
            }
        }
        return editMode;
    }
    renderViewMode() {
        let { value } = this.props;
        if (!this.isEditMode()) {
            let address: GoogleAddressNetCore = value;
            if (!address) {
                return (<div className="form__group field">None
                </div>)
            }
            return (<div className="form__group field">
                <div>
                    {address.streetNumber} {address.route} {address.locality}
                </div>
                <div>
                    {address.administrativeAreaLevel1} {address.postalCode} {address.country}
                </div>
            </div>)
        }
        else {
            return false;
        }
    }
    render() {
        const { query } = this.state;

        if (!this.isEditMode()) {
            return this.renderViewMode();
        }
        return (
            <div id={this.state.componentId} className="address-input">
                <div className="search-location-input">
                    <input
                        id={this.state.id}
                        onChange={event => {
                            this.setState({ query: event.target.value });
                            console.log(event.target.value);
                        }}
                        onFocus={() => {
                            this.geolocate();
                        }}
                        placeholder="Enter a City"
                        value={query || ''}
                    />
                </div>
                <div id="address">
                    <div>
                        <div className="row">
                            <div className="label">Street address</div>
                            <div className="slimField">
                                <input className="field" data-field="street_number" disabled={true} />
                            </div>
                            <div className="wideField">
                                <input className="field" data-field="route" disabled={true} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="label">City</div>
                            <div className="wideField">
                                <input className="field" data-field="locality" disabled={true} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="label">State</div>
                            <div className="slimField">
                                <input
                                    className="field"
                                    data-field="administrative_area_level_1"
                                    disabled={true}
                                />
                            </div>
                            <div className="label">Zip code</div>
                            <div className="wideField">
                                <input className="field" data-field="postal_code" disabled={true} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="label">Country</div>
                            <div className="wideField">
                                <input className="field" data-field="country" disabled={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export interface GoogleAddress {
    street_number: string;
    route: string;
    administrative_area_level_1: string;
    locality: string;
    postal_code: string;
    country: string;
    id: string;
}
export interface GoogleAddressNetCore {
    streetNumber: string;
    route: string;
    administrativeAreaLevel1: string;
    postalCode: string;
    locality: string;
    country: string
    id: string;
}