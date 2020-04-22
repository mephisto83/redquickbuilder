import NameLikeValidation from "./NameLikeValidation";
function DescriptionLikeValidation(args: any ) {
  // node0,node1,node2,node3,node4,node5
  return NameLikeValidation({ ...args, maxLength: 500 });
}

DescriptionLikeValidation.title = "Description List Validation";

DescriptionLikeValidation.description =
  "Minimum length 3, Max length 500 and just alpha chars.";

export default DescriptionLikeValidation;
