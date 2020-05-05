import {
	NodesByType,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeTitle,
	NodeProperties,
	GetNodeProp,
	GetDefaults,
	ScreenOptionFilter
} from '../../actions/uiactions';
import { NodeTypes } from '../../constants/nodetypes';
import AddComponent from '../AddComponent';
import { ComponentTypeKeys } from '../../constants/componenttypes';
import AddMenuComponent from '../layouts/AddMenuComponent';
import { MenuTreeOptions, MenuTreeOptionKeys } from '../../constants/menu';
import GridHeaderMainMenuMain from '../layouts/GridHeaderMainMenuMain';

export default async function AddComponentsToScreenOptions(progresFunc: any, screenFilter: Function = () => true) {
	const screenOptions = NodesByType(null, NodeTypes.ScreenOption);
	const menuTreeOption = MenuTreeOptionKeys.ModelMethodMenu;
	await screenOptions
		.filter(ScreenOptionFilter)
		.filter(screenFilter)
		.forEachAsync(async (screenOption: any, index: any, total: any) => {
			const context = {
				title: null,
				menu: null
			};
			const defaults = GetDefaults({
				node: screenOption.id,
				targetFunction: GridHeaderMainMenuMain
			});

			graphOperation(
				AddComponent({
					component: screenOption.id,
					uiType: GetNodeProp(screenOption, NodeProperties.UIType),
					componentType: ComponentTypeKeys.H1,
					componentName: `${GetNodeTitle(screenOption)} Title`,
					callback: (titleContext: any) => {
						context.title = titleContext.entry;
					}
				})
			)(GetDispatchFunc(), GetStateFunc());

			graphOperation(
				AddMenuComponent({
					component: screenOption.id,
					componentType: ComponentTypeKeys.H1,
					componentName: `${GetNodeTitle(screenOption)} Menu`,
					uiType: GetNodeProp(screenOption, NodeProperties.UIType),
					navigate_function: MenuTreeOptions[menuTreeOption].navigate_function(),
					menuGeneration: MenuTreeOptions[menuTreeOption].menuGeneration(),
					buildMethod: MenuTreeOptions[menuTreeOption].buildMethod,
					callback: (menuContext: any) => {
						context.menu = menuContext.entry;
					}
				})
			)(GetDispatchFunc(), GetStateFunc());

			graphOperation(
				GridHeaderMainMenuMain({
					...defaults,
					component: screenOption.id,
					mainMenu: context.menu,
					header: context.title
				})
			)(GetDispatchFunc(), GetStateFunc());

			await progresFunc(index / total);
		});
}
