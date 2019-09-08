<Item {{item_attributes}}>
    <Label>{{label}}</Label>
    <Input {...componentProperties} onChangeText={(text)=>{
        if(this.props.onChange) {
            this.props.onChange(text);
        }
    }} />
</Item>