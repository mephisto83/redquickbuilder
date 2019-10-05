<Item {{item_attributes}}>
    <Label>{{label}}</Label>
    <Input {{value}} onChangeText={(text)=>{
        if(this.props.onChange) {
            this.props.onChange(text);
        }
    }} />
</Item>