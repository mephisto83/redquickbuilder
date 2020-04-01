import { GetViewTypeModelType } from "./SetupViewTypeForCreate";

export default function GetModelPropertyForViewType(args = {}) {
  const { node } = args;

  return GetViewTypeModelType(node);
}

GetModelPropertyForViewType.title = 'Gets the model and property that the shared component will stand in for.'
