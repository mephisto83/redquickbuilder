
import fs from 'fs';
import {
    GetDataChainEntryNodes,
    APPLICATION,
    CURRENT_GRAPH,
    GRAPHS,
    UIC,
    setTestGetState,
    GetDataChainFrom,
    GenerateDataChainMethod,
    GenerateChainFunction,
    GenerateChainFunctions,
    GetDataChainNextId,
    GetDataChainArgs,
    GetDataChainParts
} from '../app/actions/uiactions';
import * as asd from '../app/utils/array';
import { makeDefaultState, updateUI } from '../app/reducers/uiReducer';
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
        // console.log(code);
    });

    it('should generate a chain function function', () => {
        let result = GetDataChainEntryNodes();
        let res = result[0].id;

        let code = GenerateChainFunction(res);
        expect(code).toBeTruthy();
        // console.log(code);
    });

    it('should generate all the chain functions', () => {
        let code = GenerateChainFunctions();

        expect(code).toBeTruthy();
    });

    let dataChainLink = '44bc72d2-0f12-4d80-85de-ac00f3ed2f80';
    it('should get the Customer node in the group', () => {

        let middleChainLink = 'eae4e18e-d645-49bf-ace2-6e0e4621c07a';

        let nextId = GetDataChainNextId(dataChainLink);


        expect(nextId).toBe(middleChainLink);


    })

    it('should get data chain arguments', () => {
        let args = GetDataChainArgs(dataChainLink);
        expect(args).toBeTruthy();
        expect(args.length).toBeTruthy();
    })
    it('should get all the chain parts', () => {
        let chainParts = GetDataChainParts(dataChainLink, []);

        expect(chainParts).toBeTruthy();
        expect(chainParts.length > 3).toBeTruthy();
    });

});