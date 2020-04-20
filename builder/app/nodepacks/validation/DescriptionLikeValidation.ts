import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";
import { GetNodeProp, GetNodeById } from "../../actions/uiactions";
import NameLikeValidation from "./NameLikeValidation";
function DescriptionLikeValidation(args) {
  // node0,node1,node2,node3,node4,node5
  return NameLikeValidation({ ...args, maxLength: 500 });
}

DescriptionLikeValidation.title = "Description List Validation";

DescriptionLikeValidation.description =
  "Minimum length 3, Max length 500 and just alpha chars.";

export default DescriptionLikeValidation;
