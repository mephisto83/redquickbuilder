/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from "react";
import { UIConnect } from "../utils/utils";
import TopViewer from "./topviewer";

import { GetCurrentGraph, VisualEq, NodeProperties, GetLinkProperty, GetNodeTitle, GetNodeProp } from "../actions/uiactions";
import Box from "./box";
import FormControl from "./formcontrol";
import * as Titles from './titles';
import CheckBox from "./checkbox";
import { NodeTypes, LinkType } from "../constants/nodetypes";
import TabContainer from "./tabcontainer";
import Tabs from "./tabs";
import TabContent from "./tabcontent";
import TabPane from "./tabpane";
import Tab from "./tab";
import { GetNodesByProperties, existsLinkBetween, findLink, existsLinksBetween } from "../methods/graph_methods";
import { ViewTypes } from "../constants/viewtypes";
import BuildAgentAccessWeb from "../nodepacks/BuildAgentAccessWeb";

const AGENT_ACCESS_VIEW_TAB = 'agent -access-view-tab';

class AgentAccessView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agents: [],
      models: [],
      agentAccess: []
    };
  }

  active() {
    return !!this.props.active;
  }

  setTable(modelIndex, agentIndex, v, value) {
    if (!this.state.agentAccess[agentIndex]) {
      this.state.agentAccess[agentIndex] = {};
    }
    if (!this.state.agentAccess[agentIndex][modelIndex]) {
      this.state.agentAccess[agentIndex][modelIndex] = {};
    }
    this.state.agentAccess[agentIndex][modelIndex][v] = value;
  }

  render() {
    const active = this.active();
    const graph = GetCurrentGraph();
    if (!graph) {
      return <div />;
    }
    const { state } = this.props;
    const onlyAgents = GetNodesByProperties({
      [NodeProperties.NODEType]: NodeTypes.Model,
      [NodeProperties.IsAgent]: true,
    }, graph).filter(x => !GetNodeProp(x, NodeProperties.IsUser));
    return (
      <TopViewer active={active} >
        <section className="content">
          <div className="row">
            <div className="col-md-2">
              <Box maxheight={600} title={Titles.Style}>
                <FormControl>
                  <CheckBox
                    label={Titles.BindAll}
                    onChange={(value) => {
                      this.setState({ bindAll: value })
                    }}
                    value={this.state.bindAll} />

                  <button className="btn btn-default btn-flat" onClick={(evt) => {
                    const accessDescriptions = GetNodesByProperties({
                      [NodeProperties.NODEType]: NodeTypes.AgentAccessDescription
                    }, graph)
                    this.setState({
                      agents: onlyAgents.map(v => v.id),
                      models: GetNodesByProperties({
                        [NodeProperties.NODEType]: NodeTypes.Model
                      }, graph).map(d => d.id),
                      agentAccess: onlyAgents.map(agent => {
                        const agentAccessDescription = accessDescriptions.filter(v => existsLinkBetween(graph, {
                          source: agent.id,
                          target: v.id,
                          type: LinkType.AgentAccess
                        }))
                        return GetNodesByProperties({
                          [NodeProperties.NODEType]: NodeTypes.Model
                        }, graph).map(model => {
                          const accessDescription = agentAccessDescription.find(v => existsLinkBetween(graph, {
                            source: v.id,
                            target: model.id,
                            link: LinkType.ModelAccess
                          }) && existsLinkBetween(graph, {
                            source: agent.id,
                            target: v.id,
                            link: LinkType.AgentAccess
                          }));
                          if (accessDescription) {
                            const link = findLink(graph, {
                              source: agent.id,
                              target: accessDescription.id
                            });
                            return {
                              [ViewTypes.GetAll]: GetLinkProperty(link, ViewTypes.GetAll) || false,
                              [ViewTypes.Get]: GetLinkProperty(link, ViewTypes.Get) || false,
                              [ViewTypes.Create]: GetLinkProperty(link, ViewTypes.Create) || false,
                              [ViewTypes.Update]: GetLinkProperty(link, ViewTypes.Update) || false,
                              [ViewTypes.Delete]: GetLinkProperty(link, ViewTypes.Delete) || false
                            }
                          }

                          return {
                            [ViewTypes.GetAll]: false,
                            [ViewTypes.Get]: false,
                            [ViewTypes.Create]: false,
                            [ViewTypes.Update]: false,
                            [ViewTypes.Delete]: false
                          }
                        })
                      })
                    });

                    evt.stopPropagation();
                    return false;
                  }} >Load Agents</button>

                  <button className="btn btn-default btn-primary" onClick={(evt) => {
                    BuildAgentAccessWeb({ ...this.state })
                    evt.stopPropagation();
                    return false;
                  }}>
                    Set
                  </button>
                </FormControl>
              </Box>
            </div>
            <div className="col-md-10">
              <TabContainer>
                <Tabs>
                  <Tab
                    active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}
                    title="agentaccessview"
                    onClick={() => {
                      this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'agentaccessview');
                    }}
                  />
                </Tabs>
              </TabContainer>
              <TabContent>
                <TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}>
                  <Box>
                    <table style={{ width: '100%', display: 'table' }}>
                      <thead>
                        <tr>
                          <th colSpan={((this.state.agents.length * Object.keys(ViewTypes).length) + 1)} style={{ cursor: 'pointer', display: 'table-caption', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                            Agent Access
                          </th>
                        </tr>
                        <tr>
                          <th />
                          {[].interpolate(0, this.state.agents.length, (index) => {
                            return (<th colSpan={5}>{GetNodeTitle(this.state.agents[index])}</th>)
                          })}
                        </tr>
                        <tr>
                          <th />
                          {[].interpolate(0, this.state.agents.length, (agentIndex) => Object.keys(ViewTypes).map((v) => (<th onClick={() => {
                            const istrue = this.state.models.some((model, modelIndex) => {
                              if (this.state.agentAccess[agentIndex] && this.state.agentAccess[agentIndex][modelIndex]) {
                                return this.state.agentAccess[agentIndex][modelIndex][v];
                              }
                              return false;
                            })
                            this.state.models.forEach((model, modelIndex) => {
                              this.setTable(modelIndex, agentIndex, v, !istrue);
                            })
                            this.setState({ agentAccess: [...this.state.agentAccess] });
                          }}>{v}</th>))).flatten()}
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.models.map((model, modelIndex) => {
                          const result = [<th style={{ cursor: 'pointer' }} key={`${model}`} onClick={() => {
                            const istrue = this.state.agents.some((agent, agentIndex) => {
                              if (this.state.agentAccess[agentIndex] && this.state.agentAccess[agentIndex][modelIndex]) {
                                return Object.values(ViewTypes).some(v => {
                                  return this.state.agentAccess[agentIndex][modelIndex][v];
                                })
                              }
                              return false;
                            })
                            this.state.agents.forEach((_, agentIndex) => {
                              return Object.values(ViewTypes).some(v => {
                                this.setTable(modelIndex, agentIndex, v, !istrue);
                              });
                            })
                            this.setState({ agentAccess: [...this.state.agentAccess] });

                          }}>{GetNodeTitle(model)}</th>];

                          result.push(...[].interpolate(0, this.state.agents.length, (index, agentIndex) => Object.keys(ViewTypes).map((v) => {
                            const accessIndex = (modelIndex * this.state.agents.length) + agentIndex;
                            const agent = this.state.agents[index]
                            return (<td key={`${model} ${modelIndex} ${this.state.agents[index]} ${agentIndex} ${(ViewTypes)[v]}`}>
                              <CheckBox
                                label={' '}
                                title={`${GetNodeTitle(agent)} ${GetNodeTitle(model)}`}
                                style={{ height: 40, width: 40 }}
                                onChange={(value) => {

                                  this.setTable(modelIndex, agentIndex, v, value);
                                  this.setState({ agentAccess: [...this.state.agentAccess] })
                                }}
                                value={this.state.agentAccess[agentIndex] && this.state.agentAccess[agentIndex][modelIndex] ? this.state.agentAccess[agentIndex][modelIndex][v] : false} />
                            </td>)
                          })))
                          return (<tr key={`key${model}`}>
                            {result.flatten()}
                          </tr>)
                        })}
                      </tbody>
                    </table>
                  </Box>
                </TabPane>
              </TabContent>
            </div>
          </div>
        </section>
      </TopViewer>
    );
  }

}

export default UIConnect(AgentAccessView);
