import { uuidv4 } from "../utils/array";

export function createComponentApi() {
    return {
        properties: {},
        instanceTypes: {}
    };
}
export function getComponentApiList(props) {
    if (props && props.properties) {
        return Object.values(props.properties).map(v => ({ title: v.property, id: v.id, value: v.property }))
    }
    return [];
}
export function addComponentApi(props, ops) {
    let { modelProp } = ops;
    if (props && props.properties) {
        if (!props.properties[modelProp])
            props.properties[modelProp] = { property: modelProp, id: uuidv4() };
        else {
            props.properties[modelProp].property = modelProp;
        }
    }
    return props;
}
export function removeComponentApi(props, ops) {
    let { modelProp } = ops;
    if (props && props.properties) {
        delete props.properties[modelProp];
    }
    return props;

}