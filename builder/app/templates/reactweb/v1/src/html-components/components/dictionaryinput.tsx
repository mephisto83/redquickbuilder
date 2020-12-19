import React, { useRef } from 'react';
import './dictionaryinput.css';

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export default class DictionaryInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            id: `component_${uuidv4()}`
        }
    }
    componentDidMount() {
        if (this.props.value) {
            this.setState({
                ...this.props.value
            });
        }

    }
    render() {
        const { query } = this.state;
        let value = this.props.value || {};
        return (
            <div id={this.state.componentId} className="dictionary-input">
                <div className="input-container">
                    <div className="key-input">
                        Key:
                    <input
                            id={this.state.id}
                            onChange={event => {
                                this.setState({ key: event.target.value });
                            }}
                            onFocus={() => {
                            }}
                            value={this.state.key}
                        />
                    </div>
                    <div className="value-input">
                        Value:
                    <input
                            id={this.state.id}
                            onChange={event => {
                                this.setState({ value: event.target.value });
                            }}
                            onFocus={() => {
                            }}
                            placeholder="Value"
                            value={this.state.value}
                        />
                    </div>
                    <button className={'add-key-value-button'} onClick={() => {
                        if (this.state.key && this.state.value) {
                            let value = this.props.value || {}
                            value[this.state.key] = this.state.value;
                            if (this.props.onChange) {
                                this.props.onChange(value);
                            }
                            if (this.props.onTextChange) {
                                this.props.onTextChange(value);
                            }
                        }
                    }} >+</button>
                </div>
                <div className="dictionary">
                    {value && value.length ? <div className="row"><div></div><div></div></div> : null}
                    {Object.keys(value).map((key: string) => {
                        let val = value[key];
                        return (
                            <div className="row" key={key}>
                                <div className="key-field" onClick={() => {
                                    this.setState({ key, value: val })
                                }}>{key}</div>
                                <div className="value-field" onClick={() => {
                                    this.setState({ key, value: val })
                                }}>
                                    {val}
                                </div>
                                <div className="button-field">
                                    <button onClick={() => {
                                        let value = this.props.value || {}
                                        delete value[key];
                                        if (this.props.onChange) {
                                            this.props.onChange(value);
                                        }
                                        if (this.props.onTextChange) {
                                            this.props.onTextChange(value);
                                        }
                                    }}>-</button>
                                </div>
                            </div>

                        )
                    })}
                </div>
            </div>
        );
    }

}
