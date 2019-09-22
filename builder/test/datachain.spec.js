
import fs from 'fs';
import { GetDataChainEntryNodes, APPLICATION, CURRENT_GRAPH, GRAPHS, UIC, setTestGetState, GetDataChainFrom, GenerateDataChainMethod, GenerateChainFunction, GenerateChainFunctions, GetDataChainNextId } from '../app/actions/uiactions';
import { makeDefaultState, updateUI } from '../app/reducers/uiReducer';
var smash_47 = fs.readFileSync(`./test/smash_47.rqb`, 'utf8');
var data_chain_example = fs.readFileSync(`./test/data_chain_example.rqb`, 'utf8');

describe('data_chain_example', () => {
    let graph = JSON.parse(data_chain_example);
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
        expect(nodes.length).toBeTruthy();

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
    });
    it('should get the Customer node in the group', () => {

        let dataChainLink = '345cf0b8-ea1f-460d-beee-95af647e47e1';
        let middleChainLink = 'd152894b-71c0-4029-a318-c98d87c77f09';
        let lastChainLink = '627f79ec-fc45-40ad-a13f-f80f4547383a';

        let nextId = GetDataChainNextId(dataChainLink);
        

        expect(nextId).toBe(middleChainLink);

        nextId = GetDataChainNextId(middleChainLink);
        expect(nextId).toBe(lastChainLink);

    })
});