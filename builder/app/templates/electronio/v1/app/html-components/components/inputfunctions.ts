export default class InputFunctions {
	static immediate(arg0) {
		return arg0.props.immediate || true;
	}
	static value(arg0) {
		if (arg0.immediate()) {
			return arg0.props.value || '';
		}
		return arg0.state.value || '';
	}
	static placeholder(arg0) {
		return arg0.props.placeholder || '';
	}
	static disabled(arg0) {
		return arg0.props.disabled ? 'disabled' : '';
	}
	static componentDidMount(arg0) {
		if (!arg0.immediate()) {
			arg0.setState({ value: arg0.props.value });
		}
	}
	static componentDidUpdate(arg0, prevProps: any) {
		if (!arg0.immediate()) {
			if (!arg0.state.focused)
				if (arg0.state.value !== prevProps.value) {
					arg0.setState({ value: arg0.props.value });
				}
		}
	}
	static handleKeyPress(arg0) {
		return (event) => {
			if (!arg0.immediate()) {
				if (event.key === 'Enter') {
					if (arg0.props.onChange) {
						arg0.props.onChange(arg0.state.value || '');
					}
				}
			}
		};
	}
	static onBlur(arg0) {
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
	static onFocus(arg0) {
		return () => {
			arg0.setState({ focused: true });
			if (arg0.props.onFocus) {
				arg0.props.onFocus();
			}
		};
	}
	static onChange(arg0) {
		return (v) => {
			if (arg0.immediate()) {
				if (arg0.props.onChange) {
					arg0.props.onChange(v);
				}

				if (arg0.props.onChangeText) {
					arg0.props.onChangeText(v.target.value);
				}
			} else {
				arg0.setState({ value: v.target.value });
			}
		};
	}
	static label(arg0) {
		return arg0.props.label || '{label}';
	}
}
