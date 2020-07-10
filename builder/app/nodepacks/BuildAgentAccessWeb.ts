import { NodesByType } from '../methods/graph_methods';
import { NodeTypes, LinkProperties, LinkPropertyKeys } from '../constants/nodetypes';
import { REMOVE_NODE, graphOperation, GetDispatchFunc, GetStateFunc, GetCurrentGraph } from '../actions/uiactions';
import AddAgentAccess from './AddAgentAccess';
import { NodeProperties } from '../components/titles';

export default function BuildAgentAccessWeb(args: any) {
	const {
		dashboardAccess,
		dashboardRouting,
		dashboardViewMount,
		dashboardScreenEffect,
		dashboardEffect,
		dashboards,
		agents,
		models,
		agentViewMount,
		agentRouting,
		agentScreenEffect,
		agentAccess,
		agentMethod,
		agentEffect
	} = args;

	const graph = GetCurrentGraph();

	const agentAccesss = NodesByType(graph, NodeTypes.AgentAccessDescription);
	const result = [
		...agentAccesss.map((v: any) => ({
			operation: REMOVE_NODE,
			options() {
				return {
					id: v.id
				};
			}
		}))
	];
	dashboards.forEach((dashboard: any) => {
		agents.forEach((agent: any) => {
			if (dashboardAccess && dashboardAccess[agent] && dashboardAccess[agent][dashboard]) {
				const values = dashboardAccess[agent][dashboard];
				const routing =
					dashboardRouting[agent] && dashboardRouting[agent][dashboard]
						? dashboardRouting[agent][dashboard] || {}
						: {};
				const mounting =
					dashboardViewMount[agent] && dashboardViewMount[agent][dashboard]
						? dashboardViewMount[agent][dashboard] || {}
						: {};
				const effects =
					dashboardEffect[agent] && dashboardEffect[agent][dashboard]
						? dashboardEffect[agent][dashboard] || {}
						: {};
				const screenEffect =
					dashboardScreenEffect[agent] && dashboardScreenEffect[agent][dashboard]
						? dashboardScreenEffect[agent][dashboard] || []
						: [];
				if (values && values.access) {
					result.push(
						...AddAgentAccess({
							dashboardId: dashboard,
							agentId: agent,
							linkProps: {},
							[LinkPropertyKeys.DashboardScreenEffectApiProps]: screenEffect,
							[LinkPropertyKeys.DashboardAccessProps]: values,
							[LinkPropertyKeys.DashboardRoutingProps]: { ...routing },
							[LinkPropertyKeys.DashboardViewMountProps]: { ...mounting },
							[LinkPropertyKeys.DashboardEffectProps]: { ...effects }
						})
					);
				}
			}
		});
	});
	models.forEach((model: any, modelIndex: any) => {
		agents.forEach((agent: any, agentIndex: any) => {
			if (agentAccess && agentAccess[agentIndex] && agentAccess[agentIndex][modelIndex]) {
				const values = agentAccess[agentIndex][modelIndex];
				const methods =
					agentMethod[agentIndex] && agentMethod[agentIndex][modelIndex]
						? agentMethod[agentIndex][modelIndex] || {}
						: {};
				const routing =
					agentRouting[agentIndex] && agentRouting[agentIndex][modelIndex]
						? agentRouting[agentIndex][modelIndex] || {}
						: {};
				const screenEffect =
					agentScreenEffect[agent] && agentScreenEffect[agent][model]
						? agentScreenEffect[agent][model] || {}
						: {};
				const mounting =
					agentViewMount[agentIndex] && agentViewMount[agentIndex][modelIndex]
						? agentViewMount[agentIndex][modelIndex] || {}
						: {};
				const effects =
					agentEffect[agentIndex] && agentEffect[agentIndex][modelIndex]
						? agentEffect[agentIndex][modelIndex] || {}
						: {};
				if (values) {
					result.push(
						...AddAgentAccess({
							modelId: model,
							agentId: agent,
							linkProps: { ...values },
							[LinkPropertyKeys.ScreenEffectApiProps]: { ...screenEffect },
							[LinkPropertyKeys.MethodProps]: { ...methods },
							[LinkPropertyKeys.RoutingProps]: { ...routing },
							[LinkPropertyKeys.MountingProps]: { ...mounting },
							[LinkPropertyKeys.EffectProps]: { ...effects }
						})
					);
				}
			}
		});
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
