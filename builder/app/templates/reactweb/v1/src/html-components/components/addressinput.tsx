import React from 'react';
import './addressinput.css';
import { uuidv4 } from './util';

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
    // shouldComponentUpdate() {
    //     return false;
    // }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (prevProps && prevProps.value && this.props.value) {
            let { value } = this.props;
            for (let i in value) {
                if (value[i] !== prevProps.values[i]) {
                    this.setState({
                        componentForm: {
                            ...this.state.componentForm,
                            [i]: value[i]
                        }
                    })
                }
            }
        }
    }
    static initialized: boolean = false;
    componentDidMount() {
        let api = (window as any).googleMapsApi || this.props.apiKey;
        if (this.props.value) {
            this.setState({
                ...this.props.value
            });
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
        for (const component in componentForm) {
            let el: any = document.querySelector(`#${this.state.componentId} [data-field="${component}"]`);
            el.value = "";
            el.disabled = false;
        }

        // Get each component of the address from the place details,
        // and then fill-in the corresponding field on the form.
        for (const component of place.address_components) {
            const addressType = component.types[0];

            if (componentForm[addressType]) {
                const val = component[componentForm[addressType]];
                let el: any = document.querySelector(`#${this.state.componentId} [data-field="${addressType}"]`);
                el.value = val;
            }
        }
        for (const component in componentForm) {
            let el: any = document.querySelector(`#${this.state.componentId} [data-field="${component}"]`);
            el.disabled = true;
        }
        if (this.props.onChange) {
            this.props.onChange(componentForm);
        }
        if (this.props.onTextChange) {
            this.props.onTextChange(componentForm);
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
        let script: any = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = () => callback();
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    render() {
        const { query } = this.state;

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
    postal_code: string;
    country: string;
    id: string;
}