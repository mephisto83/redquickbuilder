/* eslint-disable func-names */
/* eslint-disable prefer-destructuring */
import { $addComponentApiNodes } from "../actions/uiactions";
import { LinkProperties, UITypes } from "../constants/nodetypes";
import AddEvent from "./AddEvent";

export default function AddEventsToNavigateToScreen(args) {
  const { component, uiType, titleService, screen } = args;
  if (!screen) { throw new Error('missing screen'); }
  if (!component) { throw new Error('missing component'); }
  const eventType = uiType === UITypes.ReactNative ? 'onPress' : 'onClick';
  let eventTypeInstanceNode;
  let externalApiId;
  return [() => {
    return $addComponentApiNodes(component, 'label', undefined, undefined, (apiContext) => {
      externalApiId = apiContext.externalApi
    })
  },
  ...AddEvent({
    component,
    eventType,
    eventTypeHandler: false,
    callback(eventInstanceContext) {
      eventTypeInstanceNode = eventInstanceContext.eventTypeInstanceNode;
    }
  }),
  function () {
    return [
      {
        operation: "ADD_LINK_BETWEEN_NODES",
        options: {
          target: screen,
          source: eventTypeInstanceNode,
          properties: {
            ...LinkProperties.MethodCall
          }
        }
      }
    ];
  },
  function () {
    return [
      {
        operation: "ADD_LINK_BETWEEN_NODES",
        options: {
          target: titleService,
          source: externalApiId,
          properties: {
            ...LinkProperties.TitleServiceLink
          }
        }
      }
    ];
  }];
}
