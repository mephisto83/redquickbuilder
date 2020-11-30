// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import SelectInput from './selectinput';
import TabPane from './tabpane';
import * as Titles from './titles';
import { getNodeLinks, getNodesLinkedFrom } from '../methods/graph_methods';
import * as GraphMethods from '../methods/graph_methods';
import { LinkPropertyKeys } from '../constants/nodetypes';
import { FunctionConstraintKeys } from '../constants/functiontypes';
class ParameterActivityMenu extends Component<any, any> {
    mustBeModel(currentNode) {
        var { state } = this.props;
        var links = getNodeLinks(UIA.GetCurrentGraph(state), currentNode.id, GraphMethods.TARGET);
        for (var i = 0; i < links.length; i++) {
            var x = links[i];
            var constraint = UIA.GetLinkProperty(x, LinkPropertyKeys.CONSTRAINTS)
            if (constraint && constraint[FunctionConstraintKeys.IsModel]) {
                return true;
            }
        }

        return false;
    }
    mustBeProperty(currentNode) {
        var { state } = this.props;
        var links = getNodeLinks(UIA.GetCurrentGraph(state), currentNode.id, GraphMethods.TARGET);
        for (var i = 0; i < links.length; i++) {
            var x = links[i];
            var constraint = UIA.GetLinkProperty(x, LinkPropertyKeys.CONSTRAINTS)
            if (constraint && constraint[FunctionConstraintKeys.IsProperty]) {
                return true;
            }
        }

        return false;
    }
    mustBeFunction(currentNode) {
        var { state } = this.props;
        var links = getNodeLinks(UIA.GetCurrentGraph(state), currentNode.id, GraphMethods.TARGET);
        for (var i = 0; i < links.length; i++) {
            var x = links[i];
            var constraint = UIA.GetLinkProperty(x, LinkPropertyKeys.CONSTRAINTS)
            if (constraint && constraint[FunctionConstraintKeys.IsFunction]) {
                return true;
            }
        }

        return false;
    }
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Parameter);
        if (!active) {
          return <div />;
        }

        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var linkedNodes = [];
        var nodes = [];
        if (currentNode && active) {
            linkedNodes = getNodesLinkedFrom(UIA.GetCurrentGraph(state), { id: currentNode.id });
            var musBeModel = this.mustBeModel(currentNode);
            if (musBeModel) {
                nodes = UIA.NodesByType(state, UIA.NodeTypes.Model).map(node => {
                    return {
                        value: node.id,
                        title: UIA.GetNodeTitle(node)
                    }
                });
            }
            else if (this.mustBeProperty(currentNode)) {
                nodes = UIA.NodesByType(state, UIA.NodeTypes.Property).map(node => {
                    return {
                        value: node.id,
                        title: UIA.GetNodeTitle(node)
                    }
                });
            }
            else if (this.mustBeFunction(currentNode)) {
                nodes = UIA.NodesByType(state, UIA.NodeTypes.Function).map(node => {
                    return {
                        value: node.id,
                        title: UIA.GetNodeTitle(node)
                    }
                });
            }
        }
        return (
            <TabPane active={active}>
                {currentNode && linkedNodes.length === 0 ? (<SelectInput
                    label={Titles.ParameterType}
                    options={Object.keys(UIA.NodePropertyTypes).sort((a, b) => a.localeCompare(b)).map(x => {
                        return {
                            value: UIA.NodePropertyTypes[x],
                            title: x
                        }
                    })}
                    onChange={(value) => {
                        var id = currentNode.id;

                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.CodePropertyType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.CodePropertyType] : ''} />) : null}

                {currentNode ? (<SelectInput
                    label={Titles.ChoiceTypes}
                    options={nodes}
                    onChange={(value) => {
                        var id = currentNode.id;
                        this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                            target: currentNode.properties[UIA.NodeProperties.UIChoiceNode],
                            source: id
                        })
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UIChoiceNode,
                            id,
                            value
                        });
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: { ...UIA.LinkProperties.ChoiceLink }
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIChoiceNode] : ''} />) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ParameterActivityMenu)
