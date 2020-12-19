// TypeAheadDropDown.js
import React from 'react';
import './typeahead.css';
import InputFunctions from './inputfunctions';
import Validation from './validation';
import { uuidv4 } from './util';

export default class TypeAheadDropDown extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            id: `component_${uuidv4()}`,
            suggestions: [],
            text: ''
        }
    }

    label() {
        return InputFunctions.label(this);
    }
    immediate() {
        return InputFunctions.immediate(this);
    }
    value() {
        return InputFunctions.value(this);
    }
    placeholder() {
        return InputFunctions.placeholder(this);
    }
    disabled(): any {
        return InputFunctions.disabled(this);
    }
    componentDidMount() {
        InputFunctions.componentDidMount(this);
    }
    componentDidUpdate(prevProps: any) {
        InputFunctions.componentDidUpdate(this, prevProps);
    }
    cssClasses() {
        return '';
    }
    onTextChange(e: any) {
        const { iteams } = this.props;
        let suggestions: any = [];
        const value = e.target.value;
        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, `i`);
            suggestions = iteams.sort().filter((v: any) => regex.test(v));
        }


        this.setState(() => ({
            suggestions,
            text: value
        }));
    }


    suggestionSelected(value: any) {
        this.setState(() => ({
            text: value,
            suggestions: []
        }))
        InputFunctions.onChange(this)({ target: { checked: false, value: value } });
    }

    renderSuggestions = () => {
        const { suggestions } = this.state;
        if (suggestions.length === 0) {
            return null;
        }
        return (
            <ul>
                {suggestions.map((item: any) => <li
                    key={`${item.title}-$-${item.value}`}
                    value={item.value}
                    onClick={(e) => this.suggestionSelected(item.value)}>{item.title}</li>)}
            </ul>
        )
    }

    render() {
        const { text } = this.state;
        var handleKeyPress = InputFunctions.handleKeyPress(this);
        return (
            <div className="form__group field">
                <div className="TypeAheadDropDown">
                    <input
                        id={this.state.id}
                        disabled={this.disabled()}
                        className={`form-control ${this.cssClasses()}`}
                        onBlur={InputFunctions.onBlur(this)}
                        onFocus={InputFunctions.onFocus(this)}
                        value={InputFunctions.value(this)}
                        onKeyPress={handleKeyPress}
                        onChange={this.onTextChange}
                        placeholder={InputFunctions.placeholder(this)}
                        type="text"
                    />
                    {this.renderSuggestions()}
                </div>
                <Validation data={this.props.error} />
            </div >
        );
    }

}