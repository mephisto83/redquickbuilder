import {
	graphOperation,
	GetStateFunc,
	GetDispatchFunc,
	SetLayoutComponent,
	GetNodeById,
	$addComponentApiNodes,
	CONNECT_TO_TITLE_SERVICE,
	UPDATE_NODE_PROPERTY
} from '../../../actions/uiactions';
import CreateDashboard_1 from '../../CreateDashboard_1';
import AddComponent from '../../AddComponent';
import { ComponentTypes, ComponentTypeKeys } from '../../../constants/componenttypes';
import FourColumnSection from '../../FourColumnSection';
import { Graph } from '../../../methods/graph_types';
import { NodeProperties } from '../../../constants/nodetypes';
import NColumnSection from '../../NColumnSection';

export interface ButtonDescription {
	externalLabelApi?: string;
	id?: string;
	title: string;
	target: string;
	buttonId?: string;
}
export interface SmartDashbordParmater {
	buttons: ButtonDescription[];
	dashboardName: string;
	uiType: string;
	callback?: Function;
	componentName?: any;
}
export default function CreateSmartDashboard(args: SmartDashbordParmater) {
	let result: any[] = [];

	let { dashboardName } = args;
	let screenOption: string;
	let mainSection: string;
	let viewComponent: string;
	let dashboardScreen: string;

	graphOperation(
		CreateDashboard_1({
			name: dashboardName,
			uiType: args.uiType,
			callback: (dashboardContext: { entry: string; screenOption: string; mainSection: string }) => {
				mainSection = dashboardContext.mainSection;
				screenOption = dashboardContext.screenOption;
				dashboardScreen = dashboardContext.entry;
			}
		})
	)(GetDispatchFunc(), GetStateFunc());

	if (args.buttons && args.buttons.length) {
		result.push(function() {
			if (!screenOption) {
				throw new Error('no screenOption in createsmartdashboard');
			}
			return AddComponent({
				component: screenOption,
				skipLabel: true,
				componentName: args.componentName,
				componentType: ComponentTypes.ReactNative[ComponentTypeKeys.View].key,
				callback: (context: { entry: string }) => {
					viewComponent = context.entry;
				}
			});
		});
		result.push(function() {
			if (!viewComponent) {
				throw new Error('no viewComponent in createsmartdashboard');
			}
			return NColumnSection({
				component: viewComponent,
				count: args.buttons.length,
				callback: (buttonContext: { containers: [] }) => {
					if (args.buttons.length !== buttonContext.containers.length) {
						throw new Error('produced the wrong number of buttons');
					}
					buttonContext.containers.forEach((id: string, index: number) => {
						args.buttons[index].buttonId = id;
					});
				}
			});
		});

		result.push(function(graph: Graph) {
			if (!screenOption) {
				throw new Error('missing screenOption');
			}
			if (!mainSection) {
				throw new Error('missing mainSection');
			}
			if (!viewComponent) {
				throw new Error('missing viewComponent');
			}
			args.buttons.forEach((btnInfo: ButtonDescription) => {
				if (!btnInfo.buttonId) {
					throw new Error('missing button Id');
				}
			});
			let layout: any;
			layout = SetLayoutComponent(GetNodeById(screenOption, graph), mainSection, viewComponent);

			return {
				operation: UPDATE_NODE_PROPERTY,
				options() {
					return {
						id: screenOption,
						properties: { [NodeProperties.Layout]: layout }
					};
				}
			};
		});

		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				return function() {
					return AddComponent({
						component: viewComponent,
						skipLabel: true,
						componentType: ComponentTypes.ReactNative[ComponentTypeKeys.Button].key,
						callback: (bt: { entry: string }) => {
							button.id = bt.entry;
						}
					});
				};
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				return function() {
					if (button.id)
						return $addComponentApiNodes(button.id, 'label', null, {}, (inner: { externalApi: string }) => {
							button.externalLabelApi = inner.externalApi;
						});
					throw new Error('missing button id in create smart dashboards');
				};
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				return function() {
					if (button.externalLabelApi) {
						return {
							operation: CONNECT_TO_TITLE_SERVICE,
							options: {
								id: button.externalLabelApi
							}
						};
					}
					throw new Error('external label api is missing in create smart dashboards');
				};
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				return function() {
					if (button.externalLabelApi) {
						return {
							operation: UPDATE_NODE_PROPERTY,
							options: {
								id: button.id,
								properties: {
									[NodeProperties.UIText]: `${button.title}`,
									[NodeProperties.Target]: button.target
								}
							}
						};
					}
					throw new Error('external label api is missing in create smart dashboards');
				};
			})
		);
		result.push(function(graph: Graph) {
			let layout: any;
			args.buttons.forEach((button: ButtonDescription, index: number) => {
				if (button.id && button.buttonId) {
					layout = SetLayoutComponent(GetNodeById(viewComponent, graph), button.buttonId, button.id);
				} else {
					throw new Error('button no found, in create smart dashboard');
				}
			});
			return {
				operation: UPDATE_NODE_PROPERTY,
				options() {
					return {
						id: viewComponent,
						properties: { [NodeProperties.Layout]: layout }
					};
				}
			};
		});
		result.push(function() {
			return {
				operation: UPDATE_NODE_PROPERTY,
				options: () => {
					return {
						id: screenOption,
						properties: {
							[NodeProperties.DashboardButtons]: args.buttons
						}
					};
				}
			};
		});
		result.push(function() {
			if (args.callback) {
				args.callback({
					entry: dashboardScreen,
					buttons: args.buttons
				});
			}
		});
	}

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
