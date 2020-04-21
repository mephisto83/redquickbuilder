import { NEW_LINE } from "../constants/nodetypes";

export function calculateContrast(c1: any, c2: any) {
  let c1_ = relativeLuminance(c1);
  let c2_ = relativeLuminance(c2);
  let L1 = Math.max(c1_, c2_);
  let L2 = Math.min(c1_, c2_);
  return (L1 + 0.05) / (L2 + 0.05);
}
export function relativeLuminance(color: any[]) {
  /**
     * relative luminance
the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white

Note 1: For the sRGB colorspace, the relative luminance of a color is defined as L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:

if RsRGB <= 0.03928 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4

if GsRGB <= 0.03928 then G = GsRGB/12.92 else G = ((GsRGB+0.055)/1.055) ^ 2.4

if BsRGB <= 0.03928 then B = BsRGB/12.92 else B = ((BsRGB+0.055)/1.055) ^ 2.4

and RsRGB, GsRGB, and BsRGB are defined as:

RsRGB = R8bit/255

GsRGB = G8bit/255

BsRGB = B8bit/255
     */
  if (color.startsWith("#")) {
    color = color
      .split("")
      .subset(1)
      .join("");
  }

  let Rs = parseInt(`${color[0]}${color[1]}`, 16) / 255;
  let Gs = parseInt(`${color[2]}${color[3]}`, 16) / 255;
  let Bs = parseInt(`${color[4]}${color[5]}`, 16) / 255;
  let r, g, b;
  let minv = 0.03928;
  function calc(c: number) {
    let r;
    if (c <= minv) {
      r = c / 12.92;
    } else {
      r = Math.pow((c + 0.55) / 1.055, 2.4);
    }
    return r;
  }

  r = calc(Rs);
  g = calc(Gs);
  b = calc(Bs);
  let L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L;
}

export function getStringInserts(str = "") {
  ///\${[a-zA-Z0-9]*}
  const regex = /\${[a-zA-Z0-9_]*}/gm;
  let m;
  let result: string[] = [];
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (match) {
        result.push(match);
      }
    });
  }

  return result;
}
export function getReferenceInserts(str = "") {
  ///\${[a-zA-Z0-9]*}
  const regex = /\#{[a-zA-Z0-9_@|\- ~]*}/gm;

  let m;
  let result: string[] = [];
  let regexes = [regex];
  regexes.map(regex => {
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (match) {
          result.push(match);
        }
      });
    }
  });

  return result;
}
export function getGuids(str = "") {
  const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gm;
  let m;
  let result: string[] = [];
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (match) {
        result.push(match);
      }
    });
  }

  return result;
}

export function getGroupGuids(str = "") {
  const regex = /group\-(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gm;
  let m;
  let result: any[] = [];
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (match) {
        result.push(match);
      }
    });
  }

  return result
    .map(v => getGuids(v))
    .flatten()
    .filter((x: any) => x);
}
export function getNodePropertyGuids(obj: any) {
  let str = JSON.stringify(obj);
  let guids = getGuids(str).unique();

  return guids;
}
export function processRecording(str: string | undefined) {
  let guids = getGuids(str).unique();
  let groupGuids = getGroupGuids(str).unique();
  let nodeIndexes = {};
  groupGuids.map((v: any, index: number) => {
    nodeIndexes[guids.indexOf(v) - index] = index;
  });
  guids = guids.filter((v: any) => !groupGuids.some((t: any) => v == t));
  let commands = JSON.parse(str);
  let unaccountedGuids = [...guids];
  commands.map((command: { callback: any; options: { groupProperties: any; callbackg: any; callback: any; }; callbackGroup: any; }) => {
    if (command.callback) {
      if (command.options) {
        if (command.callbackGroup && command.options.groupProperties) {
          command.options.callbackg = command.callback;
        } else {
          command.options.callback = command.callback;
        }
      }
    }

    if (unaccountedGuids.some(v => v === command.callback)) {
      unaccountedGuids = [
        ...unaccountedGuids.filter(x => x !== command.callback)
      ];
    }
    delete command.callback;
    delete command.callbackGroup;
  });
  str = JSON.stringify(commands, null, 4);
  guids.map((guid: any, index: string | number) => {
    var subregex = new RegExp(`"callback": "${guid}"`, "g");
    str = str.replace(
      subregex,
      `"callback": function(node) { context.node${index} = node.id; }`
    );
    subregex = new RegExp(`"callbackg": "${guid}"`, "g");
    str = str.replace(
      subregex,
      `"callback": function(node, graph, group) { context.node${index} = node.id;
      context.group${nodeIndexes[index]} = group;
    }`
    );
    subregex = new RegExp(`"${guid}":`, "g");
    str = str.replace(subregex, `[context.node${index}]:`);
    subregex = new RegExp(`"${guid}"`, "g");
    str = str.replace(subregex, `context.node${index}`);
  });

  groupGuids.map((guid: any, index: any) => {
    var subregex = new RegExp(`"${guid}":`, "g");
    str = str.replace(subregex, `[context.group${index}]:`);
    subregex = new RegExp(`"${guid}"`, "g");
    str = str.replace(subregex, `context.group${index}`);
  });
  let firstFunction$re = /\[ *\n *{/gm;
  str = str.replace(
    firstFunction$re,
    `[
      function(graph) {
      return [{
`
  );

  let functionStart$re = /,\n *{/gm;
  str = str.replace(
    functionStart$re,
    `,
    {
    function(graph) {
      return [{
`
  );
  let functionEnd$re = /},\n *{/gm;
  str = str.replace(
    functionEnd$re,
    `}]
    },
`
  );
  let lastFunction$re = /}\n *]/gm;
  str = str.replace(
    lastFunction$re,
    `}]
  }]
`
  );
  let inserts = getStringInserts(str);
  inserts.map(insert => {
    var subregex = new RegExp("\\" + insert, "g");
    str = str.replace(
      subregex,
      `" + args.${insert.substr(2, insert.length - 3)} + "`
    );
  });
  const regex = /context.groupundefined = group;/gm;
  str = str.replace(regex, "");
  let temp = guids
    .map((x: any, index: any) => {
      return `{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node${index},
          value: false
        }
      }
    }`;
    })
    .subset(1)
    .join("," + NEW_LINE);
  return `
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // ${unaccountedGuids
      .map(v => {
        let index = guids.indexOf(v);
        return "node" + index;
      })
      .join()}

      // ${inserts
        .map(insert => insert.substr(2, insert.length - 3))
        .join(", ")}
      ${inserts
        .map(insert => {
          let temp = insert.substr(2, insert.length - 3);
          return `if(!args.${temp}){
          throw new Error('missing ${temp} argument');
        }`;
        })
        .join("")}
    let context = {
      ...args${
        unaccountedGuids.length
          ? "," +
            NEW_LINE +
            unaccountedGuids
              .map(v => {
                let index = guids.indexOf(v);
                return "node" + index + ": uuidv4() ";
              })
              .join("," + NEW_LINE)
          : ""
      }
    };
    let {
      viewPackages
    } = args;
    viewPackages = {
      [NodeProperties.ViewPackage]: uuidv4(),
      ...(viewPackages||{})
    };
    let result = ${str};
    let clearPinned = [${temp}];
    let applyViewPackages = [${guids
      .map((guid: any, index: any) => {
        if (unaccountedGuids.indexOf(guid) === -1) {
          return `{
          operation: 'UPDATE_NODE_PROPERTY',
          options : function() {
            return {
              id: context.node${index},
              properties: viewPackages
            }
          }
        }`;
        }
        return false;
      })
      .filter((x: any) => x)
      .join()}]
    return [
      ...result,
      ...clearPinned,
      ...applyViewPackages,
      function() {
        if (context.callback) {
          context.entry = context.node0;
          context.callback(context);
        }
        return [];
      }];
  }`;
}
