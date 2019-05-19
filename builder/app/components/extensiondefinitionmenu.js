// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import DropDownMenu from './dropdown';
import Box from './box';

const EXTENSION_DEFINITION_MENU = 'EXTENSION_DEFINITION_MENU';
class ExtensionDefinitionMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ValidationListItem);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        return (
            <DropDownMenu icon={'fa fa-cog'} width={500} open={UIA.Visual(state, EXTENSION_DEFINITION_MENU)} onClick={() => {
                this.props.toggleVisual(EXTENSION_DEFINITION_MENU)
            }}>
                <Box title={Titles.ExtensionDefinition}>

                </Box>
            </DropDownMenu>
        );
    }
}

export default UIConnect(ExtensionDefinitionMenu)