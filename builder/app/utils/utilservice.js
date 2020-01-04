export function calculateContrast(c1, c2) {
  let c1_ = relativeLuminance(c1);
  let c2_ = relativeLuminance(c2);
  let L1 = Math.max(c1_, c2_);
  let L2 = Math.min(c1_, c2_);
  return (L1 + 0.05) / (L2 + 0.05);
}
export function relativeLuminance(color) {
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
  function calc(c) {
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

export function getGuids(str = "") {
  const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gm;
  let m;
  let result = [];
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
  let result = [];
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
    .filter(x => x);
}
export function processRecording(str) {
  let guids = getGuids(str).unique();
  let groupGuids = getGroupGuids(str).unique();
  let nodeIndexes = {};
  groupGuids.map((v, index) => {
    nodeIndexes[guids.indexOf(v) - index] = index;
  });
  guids = guids.filter(v => !groupGuids.some(t => v == t));
  let commands = JSON.parse(str);
  let unaccountedGuids = [...guids];
  commands.map(command => {
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
  guids.map((guid, index) => {
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

  groupGuids.map((guid, index) => {
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

  return `export default function(args = {}) {
    // ${unaccountedGuids
      .map(v => {
        let index = guids.indexOf(v);
        return "node" + index;
      })
      .join()}
    let context = {
      ...args
    };

    let result = ${str};

    return [...result,
      function() {
        if (context.callback) {
          context.entry = context.node0;
          context.callback(context);
        }
        return [];
      }];
  }`;
}
