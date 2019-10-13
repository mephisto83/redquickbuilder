// @flow
import React, { Component } from 'react';


export default class LayoutCreator extends Component {
    buildLayoutTree(layoutObj, currentRoot) {
        let result = [];
        let { layout, properties } = layoutObj;
        if (!currentRoot) {
            currentRoot = layout;
        }

        Object.keys(currentRoot).map((item, index) => {
            result.push(this.createSection(layoutObj, item, currentRoot[item], index + 1));
        })
        return result;
    }
    createSection(layoutObj, item, currentRoot, index) {
        let { properties } = layoutObj;
        let style = properties[item].style || {};
        let tree = Object.keys(currentRoot).length ? this.buildLayoutTree(layoutObj, currentRoot) : null;
        let overrides = {};
        if (this.props.selectedCell === item) {
            overrides = { backgroundColor: '#ffffff33' }
        }
        overrides.padding = 10;
        return (<div key={item} onClick={(e) => {
            if (this.props.onSelectionClick) {
                this.props.onSelectionClick(item);
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }} style={{ ...style, ...overrides }}>{tree || index}</div>)
    }
    render() {
        let colors = 'dd4b39-3a405a-fff2f2-e8e8e8-857885'.split('-').map(t => (`#${t}`));
        let layoutObj = this.props.layout;
        let tree = null;
        if (layoutObj) {
            tree = this.buildLayoutTree(layoutObj);
        }

        return (
            <div style={{
                display: 'flex',
                height: '100%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: (colors[2]), ...this.props.style
            }}>
                {tree}
            </div>
        );
    }
}
