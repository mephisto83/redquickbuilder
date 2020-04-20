import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node0,node1,node2,node3,node4,node5
  let context = {
    node0: args.component,
    node1: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4(),
    ...args
  };
  return [
    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
                }
              },
              properties: {
                [context.node1]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    componentType: "Content"
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node2]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "MainHeader", "TopMenu"],
                    componentType: "View"
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: [],
                    componentType: "View"
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"],
                    componentType: "View"
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {
                    [context.node5]: context.node6
                  },
                  cellModel: {},
                  properties: {
                    tags: ["MainSection"],
                    componentType: "View"
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                }
              }
            }
          }
        }
      ];
    }
  ];
}
