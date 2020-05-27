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

export interface ButtonDescription {
	externalLabelApi: string;
	id?: string;
	title: string;
}
export interface SmartDashbordParmater {
	buttons: [];
	dashboardName: string;
}
export default function CreateSmartDashboard(args: SmartDashbordParmater) {
	let result: any[] = [];

	let { dashboardName } = args;
	let screenOption: string;
	let mainSection: string;
	let viewComponent: string;
	let buttonContainers: string[];
	let dashboardScreen: string;
	result.push(
		CreateDashboard_1({
			name: dashboardName,
			callback: (dashboardContext: { entry: string; screenOption: string; mainSection: string }) => {
				mainSection = dashboardContext.mainSection;
				screenOption = dashboardContext.screenOption;
				dashboardScreen = dashboardContext.entry;
			}
		})
	);

	if (args.buttons && args.buttons.length) {
		result.push(function() {
			if (!screenOption) {
				throw new Error('no screenOption in createsmartdashboard');
			}
			return AddComponent({
				component: screenOption,
				componentType: ComponentTypes.ReactNative[ComponentTypeKeys.View],
				callback: (context: { entry: string }) => {
					viewComponent = context.entry;
				}
			});
		});
		result.push(function() {
			if (!viewComponent) {
				throw new Error('no viewComponent in createsmartdashboard');
			}
			return FourColumnSection({
				component: viewComponent,
				callback: (buttonContext: { containers: [] }) => {
					buttonContainers = buttonContext.containers;
				}
			});
		});
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				return AddComponent({
					component: viewComponent,
					componentType: ComponentTypes.ReactNative[ComponentTypeKeys.Button],
					callback: (bt: { entry: string }) => {
						button.id = bt.entry;
					}
				});
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				if (button.id)
					return $addComponentApiNodes(button.id, 'label', null, {}, (inner: { externalApi: string }) => {
						button.externalLabelApi = inner.externalApi;
					});
				throw new Error('missing button id in create smart dashboards');
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				if (button.externalLabelApi) {
					return {
						operation: CONNECT_TO_TITLE_SERVICE,
						options: {
							id: button.externalLabelApi
						}
					};
				}
				throw new Error('external label api is missing in create smart dashboards');
			})
		);
		result.push(
			...args.buttons.map((button: ButtonDescription) => {
				if (button.externalLabelApi) {
					return {
						operation: UPDATE_NODE_PROPERTY,
						options: {
							id: button.id,
							properties: { [NodeProperties.UIText]: button.title }
						}
					};
				}
				throw new Error('external label api is missing in create smart dashboards');
			})
		);
		result.push(function(graph: Graph) {
			if (!buttonContainers) {
				throw new Error('missing button containers');
			}
			let layout: any;
			args.buttons.forEach((button: ButtonDescription, index: number) => {
				if (button.id) {
					layout = SetLayoutComponent(GetNodeById(viewComponent, graph), buttonContainers[index], button.id);
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
	}

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
