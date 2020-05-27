import { graphOperation, GetStateFunc, GetDispatchFunc } from '../../../actions/uiactions';
import CreateDashboard_1 from '../../CreateDashboard_1';
import AddComponent from '../../AddComponent';
import { ComponentTypes } from '../../../constants/componenttypes';
import FourColumnSection from '../../FourColumnSection';

export interface ButtonDescription {}
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
	result.push(
		CreateDashboard_1({
			name: dashboardName,
			callback: (dashboardContext: { entry: string; screenOption: string; mainSection: string }) => {
				mainSection = dashboardContext.mainSection;
				screenOption = dashboardContext.screenOption;
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
				componentType: ComponentTypes.ReactNative.View,
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
	}

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
