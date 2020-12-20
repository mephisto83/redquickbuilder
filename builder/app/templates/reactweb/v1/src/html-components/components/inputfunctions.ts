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
		return arg0.props.placeholder || '';
	}

	static disabled(arg0: any) {
		return arg0.props.disabled ? 'disabled' : '';
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
	static onChange(arg0: any) {
		return (v: { target: { checked: any; value: any } }) => {
			if (arg0.immediate()) {
				if (arg0.props.onChange) {
					arg0.props.onChange(v);
				}

				if (arg0.props.onChangeText) {
					if (arg0.inputType === 'checkbox') {
						arg0.props.onChangeText(v.target.checked);
					} else {
						arg0.props.onChangeText(v.target.value);
					}
				}
			} else {
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
