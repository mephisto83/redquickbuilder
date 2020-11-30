// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';

class ValidationItemFormControl extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ValidationListItem);
        if (!active) {
          return <div />;
        }

        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <SelectInput
                        options={Object.keys(UIA.ValidationRules).sort((a, b) => a.localeCompare(b)).map(x => {
                            return {
                                value: UIA.ValidationRules[x],
                                title: x
                            }
                        })}
                        label={Titles.ValidationType}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.UIValidationType,
                                id: currentNode.id,
                                value
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIValidationType] : ''} />

                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ValidationItemFormControl)
