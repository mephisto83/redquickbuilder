// TypeAheadDropDown.js
import React from 'react';
import './typeahead.css';
import InputFunctions from './inputfunctions';
import Validation from './validation';
import { uuidv4 } from './util';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';

export default class TypeAheadDropDown extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            id: `component_${uuidv4()}`,
            suggestions: [],
            immediate: false,
            hasFocus: false,
            tentativeIndex: null,
            value: ''
        }
        this.mounted = false;
        this.showOnEmptyFilter = false;
    }
    mounted: boolean;
    showOnEmptyFilter: boolean;
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
        this.mounted = true;
        InputFunctions.componentDidMount(this);
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        InputFunctions.componentDidUpdateV2(this, prevProps);
    }
    cssClasses() {
        return '';
    }
    onTextChange(e: any) {
        const value = e.target.value;


        this.setState({
            valueTitle: null,
            value: value
        });
    }


    suggestionSelected(value: any, title: any) {
        this.setState({
            value: value,
            valueTitle: title,
            hasFocus: false,
            showSuggestions: false,
            tentativeIndex: null
        })
        InputFunctions.onChange(this, true)({ target: { checked: false, value: value, valueTitle: title } });
    }

    renderSuggestions = () => {
        const { suggestions, value } = this.state;
        if (suggestions.length === 0 && !this.showOnEmptyFilter) {
            return null;
        }
        const regex = new RegExp(`^${value}`, `i`);
        if (!this.state.showSuggestions) {
            return <ul></ul>
        }
        return (
            <ul>
                {suggestions.filter((v: { title: string }) => {
                    if (this.showOnEmptyFilter && !value) {
                        return true;
                    }
                    return regex.test(v.title)
                }).map((item: any, index: number) => <li
                    key={`${item.title}-$-${item.value}`}
                    value={item.value}
                    className={index === this.state.tentativeIndex ? 'selected-item' : ''}
                    onClick={(e) => {
                        return this.suggestionSelected(item.value, item.title)
                    }}>{item.title}</li>)}
            </ul>
        )
    }
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
        if (!this.isEditMode()) {
            return (<div className="form__group field">
                {InputFunctions.value(this)}
            </div>)
        }
        else {
            return false;
        }
    }
    render() {
        var handleKeyPress = InputFunctions.handleKeyPress(this);
        let onFocus = InputFunctions.onFocus(this);

        if (!this.isEditMode()) {
            return this.renderViewMode();
        }

        return (
            <div className="form__group field" data-id={`fg-${this.state.id}`}>
                <div className="TypeAheadDropDown">
                    <input
                        id={this.state.id}
                        disabled={this.disabled()}
                        className={`form-control ${this.cssClasses()}`}
                        onBlur={InputFunctions.onBlur(this)}
                        onFocus={() => {
                            onFocus();
                            this.setState({ showSuggestions: true })
                        }}
                        value={InputFunctions.value(this)}
                        onKeyDown={(e) => {
                            if (e.keyCode) {
                                let direction: number = 0;
                                switch (`${e.keyCode}`) {
                                    case '38':
                                        direction = -1;
                                        break;
                                    case '40':
                                        direction = 1;
                                        break;
                                }
                                if (direction) {
                                    let tentativeIndex = this.state.tentativeIndex;
                                    if (tentativeIndex !== null) {
                                        tentativeIndex += direction;
                                    }
                                    else {
                                        tentativeIndex = 0;
                                    }
                                    this.setState({
                                        tentativeIndex
                                    });
                                }
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const { suggestions, value } = this.state;
                                const regex = new RegExp(`^${value}`, `i`);
                                const list = suggestions.filter((v: { title: string }) => {
                                    if (this.showOnEmptyFilter) {
                                        return true;
                                    }
                                    return regex.test(v.title)
                                });
                                let item: { title: string, value: string } = list[this.state.tentativeIndex];
                                if (item) {
                                    this.suggestionSelected(item.value, item.title);
                                    return;
                                }
                            }
                            handleKeyPress(e);
                        }}
                        onChange={(e) => {
                            this.setState({ tentativeIndex: null })
                            this.onTextChange(e);
                        }}
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