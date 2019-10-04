import * as NodeTypes from '../app/constants/nodetypes';
import fs from 'fs';
import {
    NodesByType, GRAPHS, UIC, CURRENT_GRAPH, APPLICATION,
    setTestGetState, _getPermissionsConditions
} from '../app/actions/uiactions';
import { updateUI, makeDefaultState } from '../app/reducers/uiReducer';
import { GenerateModelKeys } from '../app/service/keyservice';
var smash_37 = fs.readFileSync(`./test/smash_37.rqb`, 'utf8');

describe('description', () => {
    let graph = JSON.parse(smash_37);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let app_state = { uiReducer: state };
    setTestGetState(() => {
        return app_state;
    });


    it('should generate model keys', () => {
        let modelKeys = GenerateModelKeys({ state: app_state });
        expect(modelKeys).toBeTruthy();
        expect(Object.keys(modelKeys).length).toBeTruthy();
    });
});