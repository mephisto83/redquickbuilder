// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import { EnumerationConfig } from '../interface/methodprops';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';
import { UIConnect } from '../utils/utils';
import DashboardContainer from './dashboardcontainer';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Visual } from '../actions/uiActions';
import GraphView from './graphview';

class GraphViewer extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    minified() {
        const { state } = this.props;
        return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
    }

    render() {
        let props: any = this.props;
        const { state } = this.props;
        let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
        let enumerations: { id: string; value: string }[] = [];
        if (enumerationConfig && enumerationConfig.enumerationType) {
            enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
        }
        const Deflayout = [
            { i: 'a', x: 0, y: 0, w: 6, h: 6 }
        ];
        let graphViewPackage = Visual(state, UIA.GRAPH_WINDOW_PACKAGE);

        return (
            <DashboardContainer flex minified >
                <GraphView graphViewPackage={graphViewPackage} />
            </DashboardContainer>
        );
    }
}

export default UIConnect(GraphViewer);
