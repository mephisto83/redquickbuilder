
const context = {};
export function setParameters(params) {
  context.params = params;
}
export function useParameters() {
  return {
    ...(context.params || {})
  };
}

export function fetchModel() {

}
