import {
    GetCurrentGraph,
    GetDispatchFunc,
    GetNodesByProperties,
    GetStateFunc,
    graphOperation
} from '../../actions/uiActions';
import { ComponentTypeKeys } from '../../constants/componenttypes';
import { ApiNodeKeys, LinkType, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import SetupApiBetweenComponent from '../../nodepacks/SetupApiBetweenComponents';
import { GetNodesLinkedTo } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
export default async function AddViewIdToListItemPropertyInputs() {
    let listItems = GetNodesByProperties({
        [NodeProperties.NODEType]: NodeTypes.ComponentNode,
        [NodeProperties.ComponentType]: ComponentTypeKeys.ListItem
    });

    listItems.forEach((listItem: Node) => {
        let components = GetNodesLinkedTo(GetCurrentGraph(), {
            id: listItem.id,
            link: LinkType.Component
        });

        components.forEach((component: Node) => {
            SetupApi(listItem, 'value', component, ApiNodeKeys.ViewId, true);
        });
    });
}
export function SetupApi(parent: Node, paramName: string, child: Node, childParamName: string, skipFirst?: boolean) {
    console.log(`setup api :${paramName}`);

    graphOperation(
        SetupApiBetweenComponent(
            {
                component_a: {
                    id: parent.id,
                    external: paramName,
                    internal: paramName,
                    skipExternal: skipFirst
                },
                component_b: {
                    id: child.id,
                    external: childParamName,
                    internal: childParamName
                }
            },
            (res) => {

            }
        )
    )(GetDispatchFunc(), GetStateFunc());
}