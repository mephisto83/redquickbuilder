import * as NodeTypes from '../app/constants/nodetypes';
import fs from 'fs';
import {
    NodesByType, GRAPHS, UIC, CURRENT_GRAPH, APPLICATION,
    setTestGetState, _getPermissionsConditions
} from '../app/actions/uiactions';
import { updateUI, makeDefaultState } from '../app/reducers/uiReducer';
import { GetNode, GetMethodNode } from '../app/methods/graph_methods';
import { GetScreens, BindScreensToTemplate, GenerateScreens } from '../app/service/screenservice';
var smash_37 = fs.readFileSync(`./test/smash_37.rqb`, 'utf8');

describe('description', () => {
    let permissionId = '03fa9d11-991e-46ee-841e-fab2ea9a8d6e';
    let customerId = 'ba34fc88-4aaa-456a-b1d3-d56cd5a5b3c2';
    let graph = JSON.parse(smash_37);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let nodes = NodesByType({ uiReducer: state }, NodeTypes.NodeTypes.Model);
    let app_state = { uiReducer: state };
    let permission = GetNode(graph, permissionId);
    let customer = GetNode(graph, customerId);
    setTestGetState(() => {
        return app_state;
    });

    it('should find screens', () => {
        let screens = GetScreens();
        expect(screens).toBeTruthy();
        expect(screens.length).toBeTruthy();
    });

    it('should bind screen node to template', () => {
        let screens = BindScreensToTemplate();
        expect(screens).toBeTruthy();
        expect(screens.length).toBeTruthy();
    });

    it('should generate screens', () => {
        let screens = GenerateScreens({});
        expect(screens).toBeTruthy();
        expect(Object.keys(screens).length).toBeTruthy();
    });

    it('should lower case the first letter', () => { 
        var temp = 'FasT';
        expect('fasT' === temp.toJavascriptName()).toBeTruthy();
    });
});
