import * as NodeTypes from '../app/constants/nodetypes';
import fs from 'fs';
import {
  NodesByType, GRAPHS, UIC, CURRENT_GRAPH, APPLICATION, GetCurrentGraph, GRAPH_SCOPE, Application,
  setTestGetState, GetRootGraph, _getValidationConditions, GetMethodNode,
  GetMethodValidationParameters, GetValidationsConditions, GetConditionSetup,
  GetSelectedConditionSetup, GetConditionsClauses, GetCombinedCondition, GetValidationsSortedByAgent,
  GetArbitersForValidations, GetArbiterPropertyDefinitions, GetArbiterPropertyImplementations
} from '../app/actions/uiactions';
import { updateUI, makeDefaultState } from '../app/reducers/uiReducer';
import { GetNode } from '../app/methods/graph_methods';
import { GetValidationMethodImplementation, GetValidationMethodParameters, GetValidationMethodParametersImplementation, GetValidationMethodInterface, GetAgentValidationInterface, GetAgentValidationImplementation, GenerateAgentValidationInterfacesAndImplementations, GetValidationEntries } from '../app/service/validationservice';

var smash_36 = fs.readFileSync(`./test/smash_37.rqb`, 'utf8');

describe('description', () => {
  it('should have description', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('validation relationship', () => {
  it('should get the validations for a type', () => {
    var validations = NodeTypes.GetValidationsFor(NodeTypes.NodePropertyTypes.STRING);
    expect(Object.keys(validations).length).toBeTruthy();
  });

  it('should get the parent of a validation vector', () => {
    var parent = NodeTypes.GetValidationParents(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(parent[0]).toBeTruthy();
    expect(parent[0].id).toBe(NodeTypes.ValidationRules.AlphaNumericPuncLike);
  });
  it('should return list of more compatibles', () => {
    var compatibles = NodeTypes.GetMoreCompatibles(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(compatibles.length).toBeTruthy();
  })
  it('should return if the validations are compatible', () => {
    var compatible = NodeTypes.AreCompatible(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Numeric);
    expect(compatible).toBe(false);
  });

  it('should return -1 if the validation a is less restrictive than validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.AlphaNumericPuncLike, NodeTypes.ValidationVector.Content);
    expect(val).toBe(-1);
  });

  it('should return 1 if the validation a is more restrictive than validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.AlphaNumericPuncLike, NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(val).toBe(1);
  });

  it('should return 0 if the validation a is the same level of  validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(val).toBe(0);
  });

  it('should return 0 if the validation a incompatible the same level of  validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.Zip, NodeTypes.ValidationVector.Content);
    expect(val).toBe(0);
  });

  it('should get the validation types for a type', () => {
    var types = NodeTypes.GetValidationTypes(NodeTypes.NodePropertyTypes.STRING);
    expect(types).toBeTruthy();
    expect(types.length).toBeTruthy();
  });

  it('should get the validation types for a type', () => {
    var types = NodeTypes.GetValidationTypes(NodeTypes.NodePropertyTypes.LISTOFSTRINGS);
    expect(types).toBeTruthy();
    expect(types.length).toBeTruthy();
  });

  var smash_24 = fs.readFileSync(`./test/smash_24.rqb`, 'utf8');

  it('should get nodes by types ', () => {
    var graph = JSON.parse(smash_24);
    var state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    var nodes = NodesByType({ uiReducer: state }, NodeTypes.NodeTypes.Model);
    expect(nodes).toBeTruthy();
    expect(nodes.length).toBeTruthy();
  });

  it('should not get nodes by type if type doesnt exist in graph', () => {
    var graph = JSON.parse(smash_24);
    var state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    var nodes = NodesByType({ uiReducer: state }, `not existing type`);
    expect(nodes).toBeTruthy();
    expect(nodes.length).toBeFalsy();
  });

});


describe('description', () => {
  let validationId = 'fe42f950-829c-4eaa-b6c4-2c4c23517f7d';
  let customerId = 'ba34fc88-4aaa-456a-b1d3-d56cd5a5b3c2';
  let graph = JSON.parse(smash_36);
  let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
  state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
  let nodes = NodesByType({ uiReducer: state }, NodeTypes.NodeTypes.Model);
  let app_state = { uiReducer: state };
  let validation = GetNode(graph, validationId);
  let customer = GetNode(graph, customerId);
  setTestGetState(() => {
    return app_state;
  });

  it('should find a permission', () => {
    expect(validation).toBeTruthy();
    expect(validation.id === validationId).toBeTruthy();
  });
  it('GetRootGraph', () => {
    expect(GetRootGraph(app_state)).toBeTruthy();
  })
  it('should find the conditions connected to a validation', () => {
    let conditions = _getValidationConditions(app_state, validation.id);
    expect(conditions).toBeTruthy();
    expect(conditions.length).toBe(1);
  });

  it('should get the validation method', () => {
    let method = GetMethodNode(validation.id);
    expect(method).toBeTruthy();
  });

  it(`it should get the method's validation's parameters`, () => {
    let permissionParameters = GetMethodValidationParameters(validationId);
    expect(permissionParameters).toBeTruthy();
    expect(permissionParameters.length).toBe(3);
  });


  it('get conditions setup', () => {
    let conditions = GetValidationsConditions(validationId);
    let condition = conditions[0];
    expect(condition).toBeTruthy();
    let conditionSetup = GetConditionSetup(condition);
    expect(conditionSetup).toBeTruthy();
    let selectedConditionSetup = GetSelectedConditionSetup(validationId, condition);
    expect(selectedConditionSetup).toBeTruthy();
  });

  it('get conditions clause in c#', () => {
    let conditions = GetValidationsConditions(validationId);
    let condition = conditions[0];
    let selectedConditionSetup = GetSelectedConditionSetup(validationId, condition);
    let clauses = GetConditionsClauses(validationId, selectedConditionSetup, NodeTypes.ProgrammingLanguages.CSHARP);
    expect(clauses).toBeTruthy();
    expect(clauses.length).toBe(1);
  });

  it('get combined condition result in c#', () => {
    let combinedCondition = GetCombinedCondition(validationId);
    expect(combinedCondition).toBeTruthy();
  });

  it('get validations sorted by agent', () => {
    let validationSortedByAgent = GetValidationsSortedByAgent();
    expect(validationSortedByAgent).toBeTruthy();
  });

  it('get arbiters for validations', () => {
    let arbiters = GetArbitersForValidations(validationId);
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

  it('get validations method implementation', () => {
    let implementation = GetValidationMethodImplementation(validationId);
    expect(implementation).toBeTruthy();
  });

  it('get validations parameters', () => {
    let parameters = GetValidationMethodParameters(validationId);
    expect(parameters).toBeTruthy();
  });

  it('get validations parameters in C#', () => {
    let parameters = GetValidationMethodParametersImplementation(validationId, NodeTypes.ProgrammingLanguages.CSHARP);
    expect(parameters).toBeTruthy();
  });

  it('get validation method interface', () => {
    let _interface = GetValidationMethodInterface(validationId);
    expect(_interface);
  });


  it('get agent validation interface', () => {
    let agentpermissioninterface = GetAgentValidationInterface(customerId);
    expect(agentpermissioninterface).toBeTruthy();
  });

  it('get agent validation implentation', () => {
    let agentpermissioninterface = GetAgentValidationImplementation(customerId);
    expect(agentpermissioninterface).toBeTruthy();
  });

  it('generate agents validation interfaces and implementations', () => {
    let results = GenerateAgentValidationInterfacesAndImplementations();
    expect(results).toBeTruthy();
    expect(Object.keys(results).length).toBeTruthy();
  });


  it('get validation entries', () => {
    let validatorId = 'e08c41e1-02c1-4aff-aa70-e2398e566c09';
    let results = GetValidationEntries(customerId, validatorId);
    expect(results).toBeTruthy();
  });
});
