

// @flow
import React, { Component } from 'react';
import TabPane from './tabpane';


export default class ButtonList extends Component {
    render() {
        return (
            <TabPane active={this.props.active}>
                {(this.props.items || []).map((item) => {
                    return <div
                        key={`allowed-${item.id}`} className={`external-event ${this.props.isSelected(item) ? 'bg-red' : 'bg-green'}`}
                        style={{
                            cursor: 'pointer',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }} onClick={() => {
                            if (this.props.onClick) {
                                this.props.onClick(item);
                            }
                        }} > {item.title}</div>;
                })
                }
            </TabPane >)
    }
}