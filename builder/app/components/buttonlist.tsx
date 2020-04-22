/* eslint-disable react/destructuring-assignment */


// @flow
import React, { Component } from 'react';
import TabPane from './tabpane';


export default class ButtonList extends Component {
  render() {
    let tabPaneStyle = this.props.tabPaneStyle || {};
    return (
      <TabPane active={this.props.active} style={{ ...tabPaneStyle }}>
        {(this.props.items || []).map((item) => {
          return <div
            title={item.title}
            key={`allowed-${item.id}`} className={`external-event ${this.props.isSelected && this.props.isSelected(item) ? 'bg-red' : 'bg-green'}`}
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }} onClick={() => {
              if (this.props.onClick) {
                this.props.onClick(item);
              }
            }} > {this.props.renderItem ? this.props.renderItem(item) : item.title}</div>;
        })
        }
      </TabPane >)
  }
}
