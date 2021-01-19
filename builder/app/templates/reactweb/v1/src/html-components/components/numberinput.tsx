import Input from './input';

export default class NumberInput extends Input {
	constructor(props: any) {
		super(props);
		this.placeHolder = "XXXXXXXXXX";
		this.dataCharset = "XXXXXXXXXX";
		this.masked = true;
		this.pattern = "\d\d\d\d\d\d\d\d\d\d"
	}

	renderBeforeInput(): any {
		return <span aria-hidden="true" id={this.id + 'Mask'}><i>{this.state.value}</i>{this.props.placeholder}</span>
	}
}
