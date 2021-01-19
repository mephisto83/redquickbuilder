export default class InputFunctions {
	static immediate(arg0: any) {
		if (arg0.state.hasOwnProperty('immediate')) {
			return arg0.state.immediate;
		}
		return arg0.props.immediate || true;
	}

	static value(arg0: any) {
		if (arg0.immediate()) {
			return arg0.props.value || '';
		}
		return arg0.state.valueTitle || arg0.state.value || '';
	}

	static placeholder(arg0: any) {
		return arg0.placeHolder || arg0.props.placeholder || '';
	}
	static handleMaskChange(arg0: any, e: any) {

		var isCharsetPresent = e.target.getAttribute('data-charset'),
			maskedNumber = 'XMDY',
			maskedLetter = '_',
			placeholder = isCharsetPresent || e.target.getAttribute('data-placeholder'),
			value = e.target.value, l = placeholder.length, newValue = '',
			i, j, isInt, isLetter, strippedValue, matchesNumber, matchesLetter;

		// strip special characters
		strippedValue = isCharsetPresent ? value.replace(/\W/g, "") : value.replace(/\D/g, "");

		for (i = 0, j = 0; i < l; i++) {
			isInt = !isNaN(parseInt(strippedValue[j]));
			isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
			matchesNumber = (maskedNumber.indexOf(placeholder[i]) >= 0);
			matchesLetter = (maskedLetter.indexOf(placeholder[i]) >= 0);
			if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
				newValue += strippedValue[j++];
			} else if ((!isCharsetPresent && !isInt && matchesNumber) || (isCharsetPresent && ((matchesLetter && !isLetter) || (matchesNumber && !isInt)))) {
				//this.options.onError( e ); // write your own error handling function
				return newValue;
			} else {
				newValue += placeholder[i];
			}
			// break if no characters left and the pattern is non-special character
			if (strippedValue[j] == undefined) {
				break;
			}
		}

		if (arg0.props['data-valid-example']) {
			return InputFunctions.validateProgress(arg0, e, newValue);
		}

		return newValue;
	}
	static validateProgress(arg0: any, e: any, value: any) {
		var validExample = arg0.props['data-valid-example'],
			pattern = new RegExp(arg0.props.pattern),
			placeholder = e.target.getAttribute('data-placeholder'),
			l = value.length, testValue = '', i;

		//convert to months
		if ((l == 1) && (placeholder.toUpperCase().substr(0, 2) == 'MM')) {
			if (value > 1 && value < 10) {
				value = '0' + value;
			}
			return value;
		}

		for (i = l; i >= 0; i--) {
			testValue = value + validExample.substr(value.length);
			if (pattern.test(testValue)) {
				return value;
			} else {
				value = value.substr(0, value.length - 1);
			}
		}

		return value;
	}
	static setValueOfMask(e: any) {
		var value = e.target.value,
			placeholder = e.target.getAttribute('data-placeholder');

		return "<i>" + value + "</i>" + placeholder.substr(value.length);
	}

	static disabled(arg0: any) {
		return arg0.props.disabled ? true : false;
	}

	static componentDidMount(arg0: any) {
		if (!arg0.immediate()) {
			arg0.setState({ value: arg0.props.value });
		}
	}

	static componentDidUpdate(arg0: any, prevProps: any) {
		if (!arg0.immediate()) {
			if (!arg0.state.focused)
				if (arg0.state.value !== prevProps.value) {
					arg0.setState({ value: arg0.props.value });
				}
		}
	}

	static componentDidUpdateV2(arg0: any, prevProps: any) {
		if (!arg0.immediate()) {
			if (!arg0.state.focused)
				if (arg0.props.value !== prevProps.value) {
					arg0.setState({ value: arg0.props.value });
				}
		}
	}
	static handleKeyPress(arg0: any) {
		return (event: { key: string }) => {
			if (!arg0.immediate()) {
				if (event.key === 'Enter') {
					if (arg0.props.onChange) {
						arg0.props.onChange(arg0.state.value || '');
					}
				}
			}
		};
	}

	static onBlur(arg0: any) {
		return () => {
			if (!arg0.immediate()) {
				if (arg0.props.onChange) {
					if (arg0.state.value !== arg0.props.value) arg0.props.onChange(arg0.state.value || '');
				}
			}
			arg0.setState({ focused: false });
			if (arg0.props.onBlur) {
				arg0.props.onBlur();
			}
		};
	}

	static onFocus(arg0: any) {
		return () => {
			arg0.setState({ focused: true });
			if (arg0.props.onFocus) {
				arg0.props.onFocus();
			}
		};
	}
	static onChange(arg0: any, force?: boolean) {
		return (v: { target: { checked: any; value: any, valueTitle?: string } }) => {
			if (arg0.masked) {
				v.target.value = InputFunctions.handleMaskChange(arg0, v);
			}
			if (v.target.valueTitle === undefined) {
				v.target.valueTitle = arg0.state.valueTitle;
			}
			if (arg0.immediate() || force) {
				if (arg0.changedText) {
					arg0.changedText(v);
				}
				if (arg0.props.onChange) {
					arg0.props.onChange(v);
				}

				if (arg0.props.onChangeText) {
					if (arg0.inputType === 'checkbox') {
						arg0.props.onChangeText(v.target.checked, arg0.state.valueTitle);
					} else {
						arg0.props.onChangeText(v.target.value, arg0.state.valueTitle);
					}
				}
			} else {
				if (arg0.changedText) {
					arg0.changedText(v, arg0.state.valueTitle);
				}
				if (arg0.inputType === 'checkbox') {
					arg0.setState({ value: v.target.checked });
				} else {
					arg0.setState({ value: v.target.value });
				}
			}
		};
	}

	static label(arg0: any) {
		return arg0.props.label || '{label}';
	}
}
