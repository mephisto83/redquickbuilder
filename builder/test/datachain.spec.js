
import fs from 'fs';
import { GetDataChainEntryNodes, APPLICATION, CURRENT_GRAPH, GRAPHS, UIC, setTestGetState, GetDataChainFrom, GenerateDataChainMethod, GenerateChainFunction, GenerateChainFunctions } from '../app/actions/uiactions';
import { makeDefaultState, updateUI } from '../app/reducers/uiReducer';
var smash_47 = fs.readFileSync(`./test/smash_47.rqb`, 'utf8');

describe('description', () => {
    let graph = JSON.parse(smash_47);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let app_state = { uiReducer: state };
    setTestGetState(() => {
        return app_state;
    });

    it('should create layout', () => {
        let result = GetDataChainEntryNodes();
        expect(result).toBeTruthy();
        expect(result.length).toBeTruthy();
    });

    it('should retrieve a chain of node ids', () => {
        let result = GetDataChainEntryNodes();
        let res = result[0].id;
        let nodes = GetDataChainFrom(res);
        expect(nodes).toBeTruthy();
        expect(nodes.length).toBeTruthy();
    });

    it('should generate a function', () => {
        let result = GetDataChainEntryNodes();
        let res = result[0].id;
        let nodes = GetDataChainFrom(res);
        expect(nodes.length).toBe(2);

        let code = GenerateDataChainMethod(nodes[0]);
        expect(code).toBeTruthy();
        console.log(code);
    });
    it('should generate a chain function function', () => {
        let result = GetDataChainEntryNodes();
        let res = result[0].id;

        let code = GenerateChainFunction(res);
        expect(code).toBeTruthy();
    });

    it('should generate all the chain functions', () => {
        let code = GenerateChainFunctions();

        expect(code).toBeTruthy();
        console.log(code);
    })
});
