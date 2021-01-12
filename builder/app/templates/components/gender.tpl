<Item  style={props.style || {}} {{inlineLabel}} {{floatingLabel}}  {{style_item}} {{stackedLabel}} {{fixedLabel}} success={{{success}}} error={{{error}}} >
    <Label {{style_label}}>{{{label}}}</Label>
    <GenderInput value={{{value}}}  {{style_input}} success={{{success}}} error={{{error}}} placeholder={{{placeholder}}}
        viewModel={this.state.viewModel}
        onBlur={()=>{
            if(this.props.onBlur) {
                this.props.onBlur();
            }
        }}
        onChangeText={(_text: any)=>{
            if(this.props.onChangeText) {
                this.props.onChangeText(_text);
            }
        }}
        onFocus={() => {
            if(this.props.onFocus) {
                this.props.onFocus();
            }
        }}/>
</Item>
