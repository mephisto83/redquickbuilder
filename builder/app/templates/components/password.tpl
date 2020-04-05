<Item {{inlineLabel}} {{floatingLabel}}  {{style_item}} {{stackedLabel}} {{fixedLabel}} success={{{success}}} error={{{error}}} >
    <Label {{style_label}}>{{{label}}}</Label>
    <PasswordField value={{{value}}}  {{style_input}} success={{{success}}} error={{{error}}} placeholder={{{placeholder}}}
        onBlur={()=>{
            if(this.props.onBlur) {
                this.props.onBlur();
            }
        }}
        onChangeText={(_text)=>{
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
