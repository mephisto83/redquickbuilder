/* eslint-disable import/prefer-default-export */

import { DataChainFunctionKeys } from './datachain';

// import { titleService } from "../templates/electronio/v1/app/actions/util"
const standardNavigate = () => `(id: string) => {
  navigate.Go({ route: routes[id] })(GetDispatch(), GetState());
}`;

export const MenuTreeOptionKeys = {
	ScreenMenu: 'ScreenMenu',
	ModelMethodMenu: 'ModelMethodMenu',
	NavigationMenu: 'NavigationMenu'
};
export const MenuTreeOptions = {
	[MenuTreeOptionKeys.ScreenMenu]: {
		menuGeneration: () => `() => {
      return Object.keys(routes).filter((v: any) => routes[v].indexOf(':') === -1).map(v => ({ id: v, title: titleService.get(v), parent: null }));
    }`,
		navigate_function: standardNavigate
	},
	[MenuTreeOptionKeys.ModelMethodMenu]: {
		menuGeneration: () => `()=>true`,
		navigate_function: standardNavigate,
		buildMethod: DataChainFunctionKeys.ModelMethodMenu
	},
	[MenuTreeOptionKeys.NavigationMenu]: {
		menuGeneration: () => `() => {
      return BuildMenu();
    }`,
		navigate_function: standardNavigate
	}
};
