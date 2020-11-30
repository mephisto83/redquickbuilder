import { uuidv4 } from "../utils/array";
import { NodeProperties, LinkProperties } from "../constants/nodetypes";
import {
  GetModelPropertyChildren,
  GetNodeProp,
  NEW_COMPONENT_NODE
} from "../actions/uiActions";
import CreateFormInput from "./CreateFormInput";
import { ComponentTypes, InstanceTypes } from "../constants/componenttypes";
import SetupApiBetweenComponents from "./SetupApiBetweenComponents";
import { ViewTypes } from "../constants/viewtypes";
function createForm(
  args : any= {
    model: null,
    component: null,
    viewName: null
  }
) {
  //
  args.viewType =
    GetNodeProp(args.component, NodeProperties.ViewType) || args.viewType;
  args.uiType =
    GetNodeProp(args.component, NodeProperties.UIType) || args.uiType;
  //
  if (!args.component) {
    throw "missing component";
  }
  if (!args.viewName) {
    throw "view Name";
  }
  if (!args.viewType) {
    throw "missing a viewType";
  }

  if (!args.uiType) {
    throw "missing uiType";
  }

  let context = {
    ...args
  };
  let result = [];
  let { viewPackages, uiType, viewType } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let isSharedComponent = GetNodeProp(
    args.component,
    NodeProperties.SharedComponent
  );
  let useModelInstance = [
    ViewTypes.Get,
    ViewTypes.GetAll,
    ViewTypes.Delete
  ].some(v => viewType === v);

  let properties = GetModelPropertyChildren(args.model).filter(
    (x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty)
  );
  let formComponent: any = null;
  result.push({
    operation: NEW_COMPONENT_NODE,
    options: function( ) {

      return {
        callback: (screenComponent: any) => {
          formComponent = screenComponent.id;
        },
        parent: context.component,
        properties: {
          ...viewPackages,
          [NodeProperties.UIText]: `${context.viewName}`,
          [NodeProperties.UIType]: uiType,
          [NodeProperties.ViewType]: viewType,
          [NodeProperties.SharedComponent]: isSharedComponent,
          [NodeProperties.ComponentType]: ComponentTypes[uiType].Form.key,
          [NodeProperties.InstanceType]: useModelInstance
            ? InstanceTypes.ModelInstance
            : InstanceTypes.ScreenInstance
        },
        groupProperties: {},
        linkProperties: {
          properties: { ...LinkProperties.ComponentLink }
        }
      };
    }
  });
  properties.map((property: any) => {
    let componentProperty: any = null;
    result.push(
      function(graph: any) {
        return [
          ...CreateFormInput({
            modelProperty: property.id,
            parent: formComponent,
            viewType,
            viewPackages,
            graph,
            callback: (node: any) => {
              componentProperty = node;
            }
          })
        ];
      },
      ...["value", "viewModel"]
        .map(api => {
          return SetupApiBetweenComponents({
            viewPackages: { ...viewPackages, [NodeProperties.Pinned]: false },
            component_a: {
              id: () => args.component,
              external: api,
              internal: api
            },
            component_b: {
              id: () => formComponent,
              external: api,
              internal: api
            }
          });
        })
        .flatten(),
      ...["value", "viewModel"]
        .map(api => {
          return SetupApiBetweenComponents({
            viewPackages: { ...viewPackages, [NodeProperties.Pinned]: false },
            component_a: {
              id: () => formComponent,
              external: api,
              internal: api
            },
            component_b: {
              id: () => componentProperty.id,
              external: api,
              internal: api
            }
          });
        })
        .flatten(),
      ...["error", "success", "placeholder", "label"]
        .map(api => {
          return SetupApiBetweenComponents({
            viewPackages: { ...viewPackages, [NodeProperties.Pinned]: false },
            component_a: {
              id: () => formComponent,
              external: "value",
              internal: "value"
            },
            component_b: {
              id: () => componentProperty.id,
              external: api,
              internal: api
            }
          });
        })
        .flatten()
    );
  });

  return result;
}
createForm.description = "Create a form based on a model";

export default createForm;
