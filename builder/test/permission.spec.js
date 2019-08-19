import * as NodeTypes from '../app/constants/nodetypes';
import fs from 'fs';
import { NodesByType, GRAPHS, UIC, CURRENT_GRAPH, APPLICATION, GetCurrentGraph, GRAPH_SCOPE, Application, setTestGetState, GetRootGraph, _getPermissionsConditions, GetMethodPermissionParameters, GetNodeTitle, GetPermissionsConditions, GetConditionSetup, GetSelectedConditionSetup, GetConditionsClauses, GetCombinedCondition, GetPermissionsSortedByAgent, GetArbitersForPermissions, GetArbiterPropertyDefinitions, GetArbiterPropertyImplementations } from '../app/actions/uiactions';
import { updateUI, makeDefaultState } from '../app/reducers/uiReducer';
import { GetNode, GetMethodNode } from '../app/methods/graph_methods';
import {
    GetPermissionMethodImplementation, GetPermissionMethodParameters,
    GetPermissionMethodParametersImplementation, GetPermissionMethodInterface,
    GetAgentPermissionInterface, GetAgentPermissionImplementation
} from '../app/service/permissionservice';
var smash_35 = fs.readFileSync(`./test/smash_35.rqb`, 'utf8');

describe('description', () => {
    let permissionId = '03fa9d11-991e-46ee-841e-fab2ea9a8d6e';
    let customerId = 'ba34fc88-4aaa-456a-b1d3-d56cd5a5b3c2';
    let graph = JSON.parse(smash_35);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let nodes = NodesByType({ uiReducer: state }, NodeTypes.NodeTypes.Model);
    let app_state = { uiReducer: state };
    let permission = GetNode(graph, permissionId);
    let customer = GetNode(graph, customerId);
    setTestGetState(() => {
        return app_state;
    });

    it('should find a permission', () => {
        expect(permission).toBeTruthy();
        expect(permission.id === permissionId).toBeTruthy();
    });
    it('GetRootGraph', () => {
        expect(GetRootGraph(app_state)).toBeTruthy();
    })
    it('should find the conditions connected to a permission', () => {
        let conditions = _getPermissionsConditions(app_state, permission.id);
        expect(conditions).toBeTruthy();
        expect(conditions.length).toBe(1);
    });

    it('should get the permissions method', () => {
        let method = GetMethodNode(app_state, permission.id);
        expect(method).toBeTruthy();
    });

    it(`it should get the method's permission's parameters`, () => {
        let permissionParameters = GetMethodPermissionParameters(permissionId);
        expect(permissionParameters).toBeTruthy();
        expect(permissionParameters.length).toBe(2);
    });

    it('get conditions setup', () => {
        let conditions = GetPermissionsConditions(permissionId);
        let condition = conditions[0];
        expect(condition).toBeTruthy();
        let conditionSetup = GetConditionSetup(condition);
        expect(conditionSetup).toBeTruthy();
        let selectedConditionSetup = GetSelectedConditionSetup(permissionId, condition);
        expect(selectedConditionSetup).toBeTruthy();
    });

    it('get conditions clause in c#', () => {
        let conditions = GetPermissionsConditions(permissionId);
        let condition = conditions[0];
        let selectedConditionSetup = GetSelectedConditionSetup(permissionId, condition);
        let clauses = GetConditionsClauses(permissionId, selectedConditionSetup, NodeTypes.ProgrammingLanguages.CSHARP);
        expect(clauses).toBeTruthy();
        expect(clauses.length).toBe(2);
    });

    it('get combined condition result in c#', () => {
        let combinedCondition = GetCombinedCondition(permissionId);
        expect(combinedCondition).toBeTruthy();
    });

    it('get permissions sorted by agent', () => {
        let permissionSortedByAgent = GetPermissionsSortedByAgent();
        expect(permissionSortedByAgent).toBeTruthy();
    });

    it('get arbiters for permissions', () => {
        let arbiters = GetArbitersForPermissions(permissionId);
        expect(arbiters).toBeTruthy();
        expect(arbiters.length).toBeTruthy();
    });

    it('get arbiter property definitions', () => {
        let arbiters = GetArbiterPropertyDefinitions();
        expect(arbiters).toBeTruthy();
        expect(arbiters.length).toBeTruthy();
    });

    it('get arbiter property implementations', () => {
        let arbiters = GetArbiterPropertyImplementations();
        expect(arbiters).toBeTruthy();
        expect(arbiters.length).toBeTruthy();
    });

    it('get permissions method implementation', () => {
        let implementation = GetPermissionMethodImplementation(permissionId);
        expect(implementation).toBeTruthy();
    });

    it('get permissions parameters', () => {
        let parameters = GetPermissionMethodParameters(permissionId);
        expect(parameters).toBeTruthy();
    });

    it('get permissions parameters in C#', () => {
        let parameters = GetPermissionMethodParametersImplementation(permissionId, NodeTypes.ProgrammingLanguages.CSHARP);
        expect(parameters).toBeTruthy();
    });

    it('get permission method interface', () => {
        let _interface = GetPermissionMethodInterface(permissionId);
        expect(_interface);
    });


    it('get agent permission interface', () => {
        let agentpermissioninterface = GetAgentPermissionInterface(customerId);
        expect(agentpermissioninterface).toBeTruthy();
        console.log(agentpermissioninterface);
    });

    it('get agent permission implentation', () => {
        let agentpermissioninterface = GetAgentPermissionImplementation(customerId);
        expect(agentpermissioninterface).toBeTruthy();
        console.log(agentpermissioninterface);
    });
});
