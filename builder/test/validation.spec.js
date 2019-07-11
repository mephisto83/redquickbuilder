import * as NodeTypes from '../app/constants/nodetypes';

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
    var parent = NodeTypes.GetValidationParent(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(parent[0]).toBeTruthy();
    console.log(parent[0]);
    expect(parent[0].id).toBe(NodeTypes.ValidationRules.Numeric);
  });
})