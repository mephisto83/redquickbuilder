import React, { Component } from 'react';
export default class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    label() {
        return this.props.label || '{label}';
    }
    immediate() {
        return this.props.immediate || false;
    }
    value() {
        if (this.immediate()) {
            return this.props.value || '';
        }
        return this.state.value || '';
    }
    placeholder() {
        return this.props.placeholder || '';
    }
    disabled() {
        return this.props.disabled ? 'disabled' : '';
    }
    componentDidMount() {
        if (!this.immediate()) {
            this.setState({ value: this.props.value });
        }
    }
    componentDidUpdate(prevProps) {
        if (!this.immediate()) {
            if (!this.state.focused)
                if (this.state.value !== prevProps.value) {
                    this.setState({ value: this.props.value });
                }
        }
    }

    render() {
        var handleKeyPress = (event) => {
            if (!this.immediate()) {
                if (event.key === 'Enter') {
                    if (this.props.onChange) {
                        this.props.onChange(this.state.value || '');
                    }
                }
            }
        }
        return (
            <div className={this.props.inputgroup ? 'input-group' : "form-group"}>
                {this.props.inputgroup ? null : <label>{this.label()}</label>}
                <input type="text" disabled={this.disabled()} className={"form-control"}
                    onBlur={() => {
                        if (!this.immediate()) {
                            if (this.props.onChange) {
                                if (this.state.value !== this.props.value)
                                    this.props.onChange(this.state.value || '');
                            }
                        }
                        this.setState({ focused: false });
                    }}
                    onFocus={(() => {
                        this.setState({ focused: true });
                    })}
                    value={this.value()}
                    onKeyPress={handleKeyPress}
                    onChange={(v) => {
                        if (this.immediate()) {
                            if (this.props.onChange) {
                                this.props.onChange(v);
                            }
                            
                            if (this.props.onChangeText) {
                                this.props.onChangeText(v.target.value);
                            }
                        }
                        else {
                            this.setState({ value: v.target.value });
                        }
                    }} placeholder={this.placeholder()} />
                {this.props.inputgroup ? (<span className="input-group-btn">
                    <button type="submit" onClick={() => {
                        if (this.props.onClick) {
                            this.props.onClick();
                        }
                    }} name="search" id="search-btn" className="btn btn-flat"><i className="fa fa-edit"></i>
                    </button>
                </span>) : null}
            </div>
        );
    }
}