import { GetC } from "../../actions/uiActions"
import $service from '../utils/service';

export function GetUser(state) : {{user_type}} {
  return GetC(state, Models.{{user_type}}, $service.getUserId());
}
