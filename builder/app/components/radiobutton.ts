

// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import TreeViewMenu from './treeviewmenu';
import TextInput from './textinput';
import TreeViewItem from './treeviewitem';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import { NodeProperties } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';
const NODE_MANAGEMENT = 'NODE_MANAGEMENT';
export default class RadioButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: '',
            id: uuidv4()
        };
    }
    render() {
        let me = this;
        let values = this.props.values || [];
        return (
            <div className="form-group">
                {values.map((val, index) => {
                    let { value, title } = val;
                    return (<div className="radio" key={`${index}-radio-${this.state.id}`}>
                        <label>
                            <input type="radio" name={this.state.id} id={this.state.id} value={this.props.value === value} onChange={() => {
                                this.props.onChange(value);
                            }} checked={this.props.value === value ? 'checked' : ''} />
                            {title}
                        </label>
                    </div>);
                })}
            </div>
        );
    }
}