
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // 

      // 
      
    let context = {
      ...args
    };
    let {
      viewPackages
    } = args;
    viewPackages = {
      [NodeProperties.ViewPackage]: uuidv4(),
      ...(viewPackages||{})
    };
    let result = [];
    let clearPinned = [];
    let applyViewPackages = []
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
  }