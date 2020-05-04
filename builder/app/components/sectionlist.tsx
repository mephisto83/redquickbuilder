// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import TreeViewMenu from './treeviewmenu';
import TreeViewItem from './treeviewitem';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';

const SECTION_LIST = 'SECTION_LIST';
class SectionList extends Component<any, any> {
  render() {
    const me = this;
    const { state } = me.props;
    const sections = [];
    const subGraphs = UIA.GetSubGraphs(state);
    const rootGraph = UIA.GetRootGraph(state);
    if (subGraphs) {
      subGraphs.map(sg => {
        sections.push((
          <TreeViewItem
            key={sg.id}
            title={sg.title || Titles.Unknown}
            right={<span className="label label-primary pull-right">{sg.nodes.length}</span>}
            onClick={() => {
              me.props.setApplication(UIA.GRAPH_SCOPE, [sg.id]);
            }} />
        ))
      })
    }
    sections.push((
      <TreeViewItemContainer>
        <TextInput
          light
          label={Titles.PricePerNode}
          value={UIA.Visual(state, UIA.NODE_COST)}
          onChange={(value) => {
            this.props.setVisual(UIA.NODE_COST, parseFloat(value) || 0);
          }} />
      </TreeViewItemContainer>
    ));
    sections.push((
      <TreeViewItemContainer>
        <TextInput
          light
          label={Titles.PricePerConnection}
          value={UIA.Visual(state, UIA.NODE_CONNECTION_COST)}
          onChange={(value) => {
            this.props.setVisual(UIA.NODE_CONNECTION_COST, parseFloat(value) || 0);
          }} />
      </TreeViewItemContainer>
    ));
    let body = sections;
    if (rootGraph) {
      body = (
        <TreeViewMenu
          hideIcon
          right={<span className="label label-primary pull-right">{rootGraph.nodes.length}</span>}
          title={rootGraph.title || Titles.Unknown}
          hideArrow
          open
          active
          onClick={() => {
            me.props.setApplication(UIA.GRAPH_SCOPE, null);
          }}>
          {sections}
        </TreeViewMenu>)
    }
    return (
      <TreeViewMenu
        title={Titles.Sections}
        icon="fa fa-cart-plus"
        open={UIA.Visual(state, SECTION_LIST)}
        active={UIA.Visual(state, SECTION_LIST)}
        onClick={() => {
          this.props.toggleVisual(SECTION_LIST)
        }}>
        {body}
      </TreeViewMenu>
    );
  }
}
export default UIConnect(SectionList);
