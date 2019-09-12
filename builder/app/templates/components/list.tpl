<FlatList
    data={{{data}}}
    renderItem={{{item_render}}}
    keyExtractor={item => item.id}
/>


<FlatList
    data={(()=>{
        return GetItems(Model).filter(x=> x.deleted === false);
    })()}
    renderItem={ item => <ItemBoxListItem data={item} /> }
    keyExtractor={item => item.id}
/>