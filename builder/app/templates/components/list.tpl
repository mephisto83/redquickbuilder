<FlatList
    data={{{data}}}
    renderItem={{{item_render}}}
    keyExtractor={item => item && item.id ? item.id : item }
/>
