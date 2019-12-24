import fs from "fs";
import {
  NodesByType,
  GRAPHS,
  UIC,
  CURRENT_GRAPH,
  APPLICATION,
  setTestGetState,
  _getPermissionsConditions,
  GetNodeById
} from "../app/actions/uiactions";
import { getGuids, processRecording } from "../app/utils/utilservice";

describe("description", () => {
  it("should find all the guids", () => {
    var rec = JSON.stringify(recording);
    let matches = getGuids(rec);
    // expect(matches.length).toBe(9);
  });

  it("should replace callback for NEW_NODE creation functions", function() {
    let res = processRecording(temprec);
    console.log(res);
  });
  let temprec = `
  [
    {
        "operation": "NEW_NODE",
        "options": {},
        "callback": "5be84be9-50e1-4673-8069-91f479a2bff1"
    },
    {
        "operation": "CHANGE_NODE_TEXT",
        "options": {
            "id": "5be84be9-50e1-4673-8069-91f479a2bff1",
            "value": "Customer"
        },
        "callback": null
    },
    {
        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": "5be84be9-50e1-4673-8069-91f479a2bff1",
            "value": "model"
        },
        "callback": null
    },
    {
        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "Pinned",
            "id": "5be84be9-50e1-4673-8069-91f479a2bff1",
            "value": true
        },
        "callback": null
    },
    {
        "operation": "NEW_PROPERTY_NODE",
        "options": {
            "parent": "5be84be9-50e1-4673-8069-91f479a2bff1",
            "properties": {
                "uiAttributeType": "STRING"
            },
            "groupProperties": {},
            "linkProperties": {
                "properties": {
                    "type": "property-link",
                    "property-link": {}
                }
            }
        },
        "callback": "936c12e3-5b4e-4b7a-a539-54ee18115d48"
    },
    {
        "operation": "CHANGE_NODE_TEXT",
        "options": {
            "id": "936c12e3-5b4e-4b7a-a539-54ee18115d48",
            "value": "Name"
        },
        "callback": null
    }
]`
  let recording = [
    {
      operation: "NEW_NODE",
      options: {},
      callback: "5be84be9-50e1-4673-8069-91f479a2bff1"
    },
    {
      operation: "CHANGE_NODE_TEXT",
      options: {
        id: "5be84be9-50e1-4673-8069-91f479a2bff1",
        value: "Customer"
      },
      callback: null
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: {
        prop: "nodeType",
        id: "5be84be9-50e1-4673-8069-91f479a2bff1",
        value: "model"
      },
      callback: null
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: {
        prop: "Pinned",
        id: "5be84be9-50e1-4673-8069-91f479a2bff1",
        value: true
      },
      callback: null
    },
    {
      operation: "NEW_PROPERTY_NODE",
      options: {
        parent: "5be84be9-50e1-4673-8069-91f479a2bff1",
        properties: {
          uiAttributeType: "STRING"
        },
        groupProperties: {},
        linkProperties: {
          properties: {
            type: "property-link",
            "property-link": {}
          }
        }
      },
      callback: "936c12e3-5b4e-4b7a-a539-54ee18115d48"
    },
    {
      operation: "CHANGE_NODE_TEXT",
      options: {
        id: "936c12e3-5b4e-4b7a-a539-54ee18115d48",
        value: "Name"
      },
      callback: null
    }
  ];
});
