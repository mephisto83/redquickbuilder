import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class MultiSelectList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children
        return (
            <StyleProvider>
                <ul className={"list-group"}>
                    {(this.props.data||[]).map((item, index)=>{
                        if(this.props.renderItem){
                            let res =  this.props.renderItem({item, index})
                             res.key = this.props.keyExtractor(item);
                             return res;
                        }
                    }).filter(x=>x)}
                </ul>
            </StyleProvider>
        );
    }
}

MultiSelectList.propTypes = {
    renderItem: function(v){return typeof v === 'function'},
    keyExtractor: function(v){return typeof v === 'function'},
    data: function(v){return Array.isArray(v)}
};
