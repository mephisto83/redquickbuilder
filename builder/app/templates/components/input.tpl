<Item {{inlineLabel}} {{floatingLabel}} {{stackedLabel}} {{fixedLabel}} success={{{success}}} error={{{error}}} >
    <Label>{{{label}}}</Label>
    <Input value={{{value}}} 
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