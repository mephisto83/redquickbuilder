<FlatList  style={props.style || {}}
    data={{{data}}}
    renderItem={{{item_render}}}
    keyExtractor={(item: any) => item && item.id ? item.id : item }
/>
