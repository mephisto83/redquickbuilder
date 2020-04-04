/* eslint-disable import/prefer-default-export */

import { DataChainFunctionKeys } from "./datachain";

// import { titleService } from "../templates/electronio/v1/app/actions/util"
const standardNavigate = () => (`(id) => {
  navigate.Go({ route: routes[id] })(GetDispatch(), GetState());
}`);

export const MenuTreeOptions = {
  ScreenMenu: {
    menuGeneration: () => (`() => {
      return Object.keys(routes).filter(v => routes[v].indexOf(':') === -1).map(v => ({ id: v, title: titleService.get(v), parent: null }));
    }`),
    navigate_function: standardNavigate
  },
  ModelMethodMenu: {
    menuGeneration: () => `()=>true`,
    navigate_function: standardNavigate,
    buildMethod: DataChainFunctionKeys.ModelMethodMenu
  }
}
