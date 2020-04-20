import React from 'react';
import Input from './textinput';

export default class ColorInput extends Input {
  constructor(props) {
    super(props);
    this.inputType = 'color';
  }
}
